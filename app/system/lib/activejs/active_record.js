/*!
 * ActiveRecord
 *
 * Object relational mapper similar to Ruby's ActiveRecord implementation.
 *
 */
if (!this.lib_activerecord) this.lib_activerecord = lib_activerecord;
function lib_activerecord() {
  var json = lib('json')
    , lang = lib('lang')
    , ActiveEvent = lib('activeevent')
    , ActiveRecord;
  var __now = new Date();

  function createError(message) {
    return {
      getErrorString: function() {
        var output = String(message);
        for (var i = 0; i < arguments.length; ++i) {
          output = output.replace(/\%/, arguments[i].toString ? arguments[i].toString() : String(arguments[i]));
        }
        return output;
      }
    };
  }

  function curry(func) {
    if (arguments.length == 1) return func;
    var args = toArray(arguments).slice(1);
    return function() {
      return func.apply(this, args.concat(toArray(arguments)));
    };
  }

  function FieldDefinition(obj) {
    if (obj && obj.primaryKey) {
      return new PrimaryKeyField(obj);
    }
    Object.append(this, obj);
  }

  function PrimaryKeyField(obj) {
    Object.append(this, obj);
  }
  //PrimaryKeyField inherits from FieldDefinition
  PrimaryKeyField.prototype = Object.create(FieldDefinition.prototype);

  ActiveRecord = {
    logging: false,
    autoMigrate: true,
    Models: {},
    ModelsByTableName: {},
    ClassMethods: {},
    InstanceMethods: {},
    create: function(options, fields, methods, callback) {
      if (!ActiveRecord.connection) throw ActiveRecord.Errors.ConnectionNotEstablished.getErrorString();
      if (typeof options == "string") options = {
        tableName: options
      };
      var model = null;
      if (!options.modelName) {
        var model_name = lang.camelize(lang.inflector.singularize(options.tableName) || options.tableName);
        options.modelName = model_name.charAt(0).toUpperCase() + model_name.substring(1)
      }
      model = ActiveRecord.Models[options.modelName] = function(data) {
        this._object = {};
        this._errors = [];
        var self = this;
        //ensure that id field comes first
        this.set(self.constructor.primaryKeyName, null, false);
        var fields = self.constructor.fields;
        forEach(fields, function(field_name, field) {
          self.set(field_name, data[field_name]);
        });
        var foreign_keys = self.constructor.foreign_keys || {};
        forEach(foreign_keys, function(foreign_key) {
          if (data.hasOwnProperty(foreign_key)) {
            self.set(foreign_key, data[foreign_key]);
          }
        });
        self._id = self.get(self.constructor.primaryKeyName);
        self.notify("afterInitialize", data)
      };
      if (ActiveRecord.connection.fieldOut) {
        //reviver function revives objects from flat data (e.g. dates saved as strings)
        model.reviver = ActiveRecord.connection.fieldOut.bind(model);
      }
      model.modelName = options.modelName;
      model.tableName = options.tableName;
      model.primaryKeyName = "id";
      Object.append(model.prototype, ActiveRecord.InstanceMethods);
      if (typeof methods == 'undefined')
      for (var method_name in fields) {
        if (typeof fields[method_name] == "function") {
          methods = fields;
          fields = null;
        }
        break;
      }
      if (methods && typeof methods !== "function") {
        Object.append(model.prototype, methods);
      }
      Object.append(model, ActiveRecord.ClassMethods);
      ActiveEvent.extend(model);
      if (!fields) fields = {};
      var custom_primary_key = false;
      for (var field_name in fields) {
        var field = fields[field_name];
        if (typeof field == "object") {
          if (field.type && !("value" in field)) {
            field.value = null;
          }
          if (field.primaryKey) {
            custom_primary_key = field_name
          }
          fields[field_name] = new FieldDefinition(field);
        }
      }
      if (!custom_primary_key) fields["id"] = new FieldDefinition({primaryKey: true});
      model.fields = fields;
      if (custom_primary_key) model.primaryKeyName = custom_primary_key;
      Object.append(model.prototype, {
        modelName: model.modelName,
        tableName: model.tableName,
        primaryKeyName: model.primaryKeyName
      });
      for (var key in model.fields) {
        Finders.generateFindByField(model, key);
        Finders.generateFindAllByField(model, key)
      }
      model.get = model["findBy" + lang.camelize(model.primaryKeyName, true)];
      model.relationships = [];
      //[MODIFIED]
      ActiveRecord.ModelsByTableName[options.tableName] = model;
      model.createTable = function() {
        Migrations.Schema.createTable(options.tableName, Object.append({}, model.fields), model.foreign_keys);
      };
      if (callback) {
        callback.call(model, model);
      }
      //[/MODIFIED]
      return model;
    }
  };
  ActiveRecord.define = ActiveRecord.create;
  ActiveEvent.extend(ActiveRecord);
  ActiveRecord.eventNames = ["afterInitialize", "afterFind", "beforeSave", "afterSave", "beforeCreate", "afterCreate", "beforeDestroy", "afterDestroy"];
  (function() {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) {
      ActiveRecord.ClassMethods[ActiveRecord.eventNames[i]] = ActiveRecord.InstanceMethods[ActiveRecord.eventNames[i]] = curry(function(event_name, observer) {
        return this.observe(event_name, observer);
      }, ActiveRecord.eventNames[i]);
    }
  })();
  ActiveRecord.old_observe = ActiveRecord.observe;
  ActiveRecord.observe = function(event_name, observer) {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) if (ActiveRecord.eventNames[i] === event_name) {
      var observers = [];
      var model_observer;
      for (var model_name in ActiveRecord.Models) {
        model_observer = curry(observer, ActiveRecord.Models[model_name]);
        observers.push(model_observer);
        ActiveRecord.Models[model_name].observe(event_name, model_observer)
      }
      return observers;
    }
    return ActiveRecord.old_observe(event_name, observer);
  };
  (function() {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) ActiveRecord[ActiveRecord.eventNames[i]] = curry(function(event_name, observer) {
      ActiveRecord.observe(event_name, observer)
    }, ActiveRecord.eventNames[i])
  })();
  var Errors = {
    ConnectionNotEstablished: createError("No ActiveRecord connection is active.")
  };
  ActiveRecord.Errors = Errors;
  Object.append(ActiveRecord.InstanceMethods, {
    set: function(key, value, suppress_notifications) {
      if (typeof this[key] != 'function') this[key] = value;
      this._object[key] = value;
      if (!suppress_notifications) if (this._observers && "set" in this._observers) this.notify("set", key, value)
    },
    get: function(key) {
      return this._object[key];
    },
    toObject: function() {
      return Object.append({}, this._object);
    },
    keys: function() {
      return Object.keys(this._object);
    },
    values: function() {
      return Object.values(this._object);
    },
    updateAttribute: function(key, value) {
      this.set(key, value);
      return this.save();
    },
    updateAttributes: function(attributes) {
      for (var key in attributes) {
        this.set(key, attributes[key]);
      }
      return this.save();
    },
    reload: function() {
      if (typeof this._id == 'undefined') return false;
      var record = this.constructor.get(this._id);
      if (!record) return false;
      this._object = {};
      var raw = record.toObject();
      for (var key in raw) {
        this.set(key, raw[key]);
      }
      return true;
    },
    save: function(force_created_mode) {
      var isNew = force_created_mode || typeof this._id == 'undefined';
      this._validate(isNew);
      if (!this.isValid()) return false;
      var fields = this.constructor.fields;
      if (this.notify("beforeSave") === false) return false;
      if (isNew) {
        if (this.notify("beforeCreate") === false) return false;
        if (!fields.hasOwnProperty('created')) this.set('created', __now, true);
        if (!fields.hasOwnProperty('updated')) this.set('updated', __now, true);
        this._id = ActiveRecord.connection.insertEntity(this.tableName, this.constructor.primaryKeyName, this.flatten());
        if (!this.get(this.constructor.primaryKeyName)) {
          this.set(this.constructor.primaryKeyName, this._id);
        }
        this.notify("afterCreate");
      } else {
        if (this.notify("beforeUpdate") === false) return false;
        if (!fields.hasOwnProperty('updated')) this.set('updated', __now, true);
        ActiveRecord.connection.updateEntity(this.tableName, this.constructor.primaryKeyName, this._id, this.flatten());
        this.notify("afterUpdate");
      }
      this.notify("afterSave");
      return this;
    },
    destroy: function() {
      if (typeof this._id == 'undefined') return false;
      if (this.notify("beforeDestroy") === false) return false;
      ActiveRecord.connection.deleteEntity(this.tableName, this.constructor.primaryKeyName, this._id);
      if (this.notify("afterDestroy") === false) return false;
      return true;
    },
    //Create a normalized (flat) copy of this record's data to send to database
    flatten: function() {
      var self = this, data = {};
      var fields = self.constructor.fields;
      forEach(fields, function(key, field) {
        if (!field.primaryKey) {
          data[key] = ActiveRecord.connection.fieldIn(field, self.get(key));
        }
      });
      var foreign_keys = self.constructor.foreign_keys || {};
      forEach(foreign_keys, function(foreign_key) {
        //TODO: Replace Number.parse with function to normalize primary keys
        data[foreign_key] = Number.parse(self.get(foreign_key), null);
      });
      data.created = self.get('created');
      data.updated = self.get('updated');
      return data;
    },
    toJSON: function(object_to_inject) {
      return Object.append(this.toObject(), object_to_inject || {});
    }
  });
  Object.append(ActiveRecord.ClassMethods, {
    find: function(params) {
      var result;
      if (params === 0) return false;
      if (!params) params = {};
      if (params.first && typeof params.first === "boolean" || (typeof params === "number" || typeof params === "string" && params.match(/^\d+$/)) && arguments.length == 1) {
        if (params.first) {
          params.limit = 1;
          result = ActiveRecord.connection.findEntities(this.tableName, params);
        } else {
          result = ActiveRecord.connection.findEntitiesById(this.tableName, this.primaryKeyName, [params]);
        }
        if (result && result.iterate && result.iterate(0)) {
          return this.build(result.iterate(0), this.reviver);
        } else {
          return false;
        }
      } else {
        result = null;
        if (typeof params === "string" && !params.match(/^\d+$/)) {
          result = ActiveRecord.connection.findEntities.apply(ActiveRecord.connection, arguments);
        } else
        if (params && (typeof params == "object" && "length" in params && "slice" in params || (typeof params == "number" || typeof params == "string") && arguments.length > 1)) {
          var ids = (typeof params == "number" || typeof params == "string") && arguments.length > 1 ? toArray(arguments) : params;
          result = ActiveRecord.connection.findEntitiesById(this.tableName, this.primaryKeyName, ids)
        } else {
          result = ActiveRecord.connection.findEntities(this.tableName, params);
        }
        var response = [], self = this;
        if (result) {
          result.iterate(function(row) {
            response.push(self.build(row, self.reviver));
          });
        }
        this.resultSetFromArray(response, params);
        this.notify("afterFind", response, params);
        return response;
      }
    },
    destroy: function(id) {
      if (id == "all") {
        var instances = this.find({
          all: true
        });
        var responses = [];
        for (var i = 0; i < instances.length; ++i) responses.push(instances[i].destroy());
        return responses;
      } else if (vartype(id, 'array')) {
        var responses = [];
        for (var i = 0; i < id.length; ++i) {
          var instance = this.get(id[i]);
          if (!instance) responses.push(false);
          else responses.push(instance.destroy())
        }
        return responses;
      } else {
        var instance = this.get(id);
        if (!instance) return false;
        return instance.destroy();
      }
    },
    build: function(data, reviver) {
      if (vartype(data, 'array')) {
        var records = [];
        for (var i = 0; i < data.length; ++i) {
          records.push(this.build(data[i], reviver))
        }
        return records;
      } else {
        if (arguments.length > 1 && !reviver) throw new Error('invalid reviver function');
        if (reviver) {
          var fields = this.fields;
          for (var n in fields) {
            if (data.hasOwnProperty(n)) data[n] = reviver(fields[n], data[n]);
          }
        }
        return new this(Object.append({}, data));
      }
    },
    create: function(data) {
      if (vartype(data, 'array')) {
        var records = [];
        for (var i = 0; i < data.length; ++i) {
          records.push(this.create(data[i]))
        }
        return records;
      } else {
        var record = this.build(data);
        record.save(true);
        return record;
      }
    },
    update: function(id, attributes) {
      if (vartype(id, 'array')) {
        var attributes_is_array = vartype(attributes, 'array');
        var results = [];
        for (var i = 0; i < id.length; ++i) {
          var record = this.get(id[i]);
          if (!record) results.push(false);
          else results.push(record.updateAttributes(attributes_is_array ? attributes[i] : attributes))
        }
        return results;
      } else {
        var record = this.get(id);
        if (!record) return false;
        record.updateAttributes(attributes);
        return record;
      }
    },
    updateAll: function(updates, conditions) {
      ActiveRecord.connection.updateMultitpleEntities(this.tableName, this.primaryKeyName, updates, conditions)
    },
    resultSetFromArray: function(result_set, params) {
      if (!params) params = {};
      for (var method_name in ResultSet.InstanceMethods) result_set[method_name] = curry(ResultSet.InstanceMethods[method_name], result_set, params, this);
      return result_set;
    }
  });
  Object.append(ActiveRecord.ClassMethods, {
    processCalculationParams: function(operation, params) {
      if (!params) params = {};
      if (typeof params === "string") params = {
        where: params
      };
      return params;
    },
    performCalculation: function(operation, params, sql_fragment) {
      return ActiveRecord.connection.calculateEntities(this.tableName, this.processCalculationParams(operation, params), sql_fragment);
    },
    count: function(params) {
      return this.performCalculation("count", params, "COUNT(*)");
    },
    average: function(column_name, params) {
      return this.performCalculation("average", params, "AVG(" + column_name + ")");
    },
    max: function(column_name, params) {
      return this.performCalculation("max", params, "MAX(" + column_name + ")");
    },
    min: function(column_name, params) {
      return this.performCalculation("min", params, "MIN(" + column_name + ")");
    },
    sum: function(column_name, params) {
      return this.performCalculation("sum", params, "SUM(" + column_name + ")");
    },
    first: function() {
      return this.find({
        first: true
      });
    },
    last: function() {
      return this.find({
        first: true,
        order: this.primaryKeyName + " DESC"
      });
    }
  });
  var Adapters = {};
  ActiveRecord.adapters = [];
  ActiveRecord.connection = null;
  ActiveRecord.connect = function(adapter) {
    if (!adapter) {
      var connection = Adapters.Auto.connect.apply(Adapters.Auto, toArray(arguments).slice(1));
      if (connection) ActiveRecord.connection = connection;
      ActiveRecord.adapters.push(ActiveRecord.connection.constructor);
    } else {
      var connection = adapter.connect.apply(adapter, toArray(arguments).slice(1));
      if (connection) ActiveRecord.connection = connection;
      ActiveRecord.adapters.push(adapter);
    }
    ActiveEvent.extend(ActiveRecord.connection);
    if (!ActiveRecord.connection.preventConnectedNotification) ActiveRecord.notify("connected");
  };
  ActiveRecord.execute = function() {
    if (!ActiveRecord.connection) throw ActiveRecord.Errors.ConnectionNotEstablished.getErrorString();
    return ActiveRecord.connection.executeSQL.apply(ActiveRecord.connection, arguments);
  };
  ActiveRecord.escape = function(argument, supress_quotes) {
    var quote = supress_quotes ? '' : '"';
    return typeof argument == "number" ? argument : quote + String(argument).replace(/"/g, '\\"').replace(/\\/g, "\\\\").replace(/\0/g, "\\0") + quote;
  };
  ActiveRecord.transaction = function(proceed, error) {
    try {
      ActiveRecord.connection.transaction(proceed);
    } catch (e) {
      if (error) error(e);
      else throw e;
    }
  };
  ActiveRecord.ClassMethods.transaction = ActiveRecord.transaction;
  Adapters.defaultResultSetIterator = function(iterator) {
    if (typeof iterator === "number") {
      if (this[iterator]) {
        return Object.append({}, this[iterator]);
      } else {
        return false;
      }
    } else {
      var arr = this, len = arr.length;
      for (var i = 0; i < len; ++i) {
        var row = Object.append({}, arr[i]);
        iterator(row)
      }
    }
  };
  Adapters.InstanceMethods = {
    getColumnDefinitionFragmentFromKeyAndColumns: function(key, columns) {
      if (columns[key] instanceof Object && columns[key].hasOwnProperty('type')) {
        return this.quoteIdentifier(key) + ' ' + this.getDefaultColumnDefinitionFragmentFromType(columns[key].type);
      } else {
        return this.quoteIdentifier(key) + ' ' + this.getDefaultColumnDefinitionFragmentFromValue(columns[key]);
      }
    },
    getDefaultColumnDefinitionFragmentFromValue: function(value) {
      return this.getDefaultColumnDefinitionFragmentFromType(vartype(value));
    },
    getDefaultColumnDefinitionFragmentFromType: function(type) {
      if (type == "string") return "VARCHAR(255)";
      if (type == "number") return "INT";
      if (type == "boolean") return "TINYINT(1)";
      if (type == "date") return "DATETIME";
      return "TEXT";
    },
    quoteIdentifier: function(name) {
      return '"' + name + '"';
    },
    log: function() {
      if (!ActiveRecord.logging) return;
      var args = toArray(arguments);
      args.push('activerecord');
      sys.log.apply(sys, args);
    }
  };
  ActiveRecord.Adapters = Adapters;
  Adapters.SQL = {
    insertEntity: function(table, primary_key_name, data) {
      var keys = Object.keys(data).sort();
      var values = [];
      var args = [];
      var quoted_keys = [];
      for (var i = 0; i < keys.length; ++i) {
        args.push(data[keys[i]]);
        values.push("?");
        quoted_keys.push(this.quoteIdentifier(keys[i]))
      }
      args.unshift("INSERT INTO " + this.quoteIdentifier(table) + " (" + quoted_keys.join(",") + ") VALUES (" + values.join(",") + ")");
      this.executeSQL.apply(this, args);
      var id = data[primary_key_name] || this.getLastInsertedRowId();
      var data_with_id = Object.append({}, data);
      data_with_id[primary_key_name] = id;
      this.notify("created", table, id, data_with_id);
      return id;
    },
    updateMultitpleEntities: function(table, primary_key_name, updates, conditions) {
      var args = [];
      if (typeof updates !== "string") {
        var values = [];
        var keys = Object.keys(updates).sort();
        for (var i = 0; i < keys.length; ++i) {
          args.push(updates[keys[i]]);
          values.push(this.quoteIdentifier(keys[i]) + " = ?");
        }
        updates = values.join(", ")
      }
      var recs = this.executeSQL.apply(this, ["SELECT * FROM " + this.quoteIdentifier(table) + this.buildWhereSQLFragment(conditions, args)]);
      if (recs && recs.length) {
        var ids = [];
        for (var i = 0; i < recs.length; i++) {
          if (!recs[i]._deleted) ids.push(recs[i][primary_key_name]);
        }
        return this.executeSQL.apply(this, ["UPDATE " + this.quoteIdentifier(table) + " SET " + updates + this.quoteIdentifier(primary_key_name) + " IN (" + ids.join(',') + ")"]);
      }
      //args.unshift("UPDATE " + this.quoteIdentifier(table) + " SET " + updates + this.buildWhereSQLFragment(conditions, args));
      //return this.executeSQL.apply(this, args);
    },
    updateEntity: function(table, primary_key_name, id, data) {
      var keys = Object.keys(data).sort();
      var args = [];
      var values = [];
      for (var i = 0; i < keys.length; ++i) {
        if (keys[i] == primary_key_name) continue;
        args.push(data[keys[i]]);
        values.push(this.quoteIdentifier(keys[i]) + " = ?")
      }
      args.push(id);
      args.unshift("UPDATE " + this.quoteIdentifier(table) + " SET " + values.join(", ") + " WHERE " + this.quoteIdentifier(primary_key_name) + " = ?");
      var response = this.executeSQL.apply(this, args);
      this.notify("updated", table, id, data);
      return response;
    },
    calculateEntities: function(table, params, operation) {
      var process_count_query_result = function(response) {
        if (!response) return 0;
        return parseInt(ActiveRecord.connection.iterableFromResultSet(response).iterate(0)["calculation"], 10);
      };
      var args = this.buildSQLArguments(table, params, operation);
      return process_count_query_result(this.executeSQL.apply(this, args));
    },
    deleteEntity: function(table, primary_key_name, id) {
      var args, response;
      if (id === "all") {
        //args = ["DELETE FROM " + this.quoteIdentifier(table)];
        args = ["UPDATE " + this.quoteIdentifier(table) + " SET " + this.quoteIdentifier('_deleted') + " = ?", true];
        var ids = [];
        var ids_result_set = this.executeSQL("SELECT " + this.quoteIdentifier(primary_key_name) + " FROM " + this.quoteIdentifier(table));
        if (!ids_result_set) return null;
        this.iterableFromResultSet(ids_result_set).iterate(function(row) {
          ids.push(row[primary_key_name])
        });
        response = this.executeSQL.apply(this, args);
        for (var i = 0; i < ids.length; ++i) this.notify("destroyed", table, ids[i]);
        return response;
      } else {
        //args = ["DELETE FROM " + this.quoteIdentifier(table) + " WHERE " + this.quoteIdentifier(primary_key_name) + " = ?", id];
        args = ["UPDATE " + this.quoteIdentifier(table) + " SET " + this.quoteIdentifier('_deleted') + " = ? WHERE " + this.quoteIdentifier(primary_key_name) + " = ?", true, id];
        response = this.executeSQL.apply(this, args);
        this.notify("destroyed", table, id);
        return response;
      }
    },
    findEntitiesById: function(table, primary_key_name, ids) {
      //var response = this.executeSQL.apply(this, ["SELECT * FROM " + this.quoteIdentifier(table) + " WHERE " + this.quoteIdentifier(primary_key_name) + " IN (" + ids.join(",") + ")"]);
      var response = this.executeSQL.apply(this, ["SELECT * FROM " + this.quoteIdentifier(table) + " WHERE " + this.quoteIdentifier(primary_key_name) + " IN (" + ids.join(",") + ") AND " + this.quoteIdentifier('_deleted') + " = ?", false]);
      if (response && response.length) {
        for (var i = 0; i < response.length; i++) {
          var row = response[i];
          delete row._deleted;
        }
        ActiveRecord.connection.iterableFromResultSet(response);
      } else {
        return false;
      }
    },
    findEntities: function(table, params) {
      var args;
      if (typeof table === "string" && !table.match(/^\d+$/) && typeof params != "object") {
        args = arguments;
      } else {
        args = this.buildSQLArguments(table, params, false);
      }
      var response = this.executeSQL.apply(this, args);
      if (!response) return false;
      var iterable_response = ActiveRecord.connection.iterableFromResultSet(response);
      if (params.callback) {
        var filtered = [];
        iterable_response.iterate(function(row) {
          if (!row._deleted) {
            delete row._deleted;
            if (params.callback(row)) filtered.push(row);
          }
        });
        return filtered;
      } else {
        var filtered = [];
        iterable_response.iterate(function(row) {
          if (!row._deleted) {
            delete row._deleted;
            filtered.push(row);
          }
        });
        return (filtered.length) ? ActiveRecord.connection.iterableFromResultSet(filtered) : false;
      }
    },
    buildSQLArguments: function(table, params, calculation) {
      var args = [];
      var sql = "SELECT " + (calculation ? calculation + " AS calculation" : params.select ? params.select.join(",") : "*") + " FROM " + this.quoteIdentifier(table) + this.buildWhereSQLFragment(params.where, args) + (params.joins ? " " + params.joins : "") + (params.group ? " GROUP BY " + params.group : "") + (params.order ? " ORDER BY " + params.order : "") + (params.offset && params.limit ? " LIMIT " + params.offset + "," + params.limit : "") + (!params.offset && params.limit ? " LIMIT " + params.limit : "");
      args.unshift(sql);
      return args;
    },
    buildWhereSQLFragment: function(fragment, args) {
      var where, keys, i;
      if (fragment && vartype(fragment, 'array')) {
        for (i = 1; i < fragment.length; ++i) args.push(fragment[i]);
        return " WHERE " + fragment[0];
      } else if (fragment && typeof fragment !== "string") {
        where = "";
        keys = Object.keys(fragment);
        for (i = 0; i < keys.length; ++i) {
          where += this.quoteIdentifier(keys[i]) + " = ? AND ";
          var value;
          if (typeof fragment[keys[i]] === "number") value = fragment[keys[i]];
          else if (typeof fragment[keys[i]] == "boolean") value = parseInt(Number(fragment[keys[i]]), 10);
          else value = String(fragment[keys[i]]);
          args.push(value)
        }
        where = " WHERE " + where.substring(0, where.length - 4)
      } else if (fragment) where = " WHERE " + fragment;
      else where = "";
      return where;
    },
    dropTable: function(table_name) {
      return this.executeSQL("DROP TABLE IF EXISTS " + this.quoteIdentifier(table_name));
    },
    renameTable: function(old_table_name, new_table_name) {
      this.executeSQL("ALTER TABLE " + this.quoteIdentifier(old_table_name) + " RENAME TO " + this.quoteIdentifier(new_table_name))
    },
    addColumn: function(table_name, column_name, data_type) {
      return this.executeSQL("ALTER TABLE " + this.quoteIdentifier(table_name) + " ADD COLUMN " + this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns));
    },
    //Allows for formatting, serialization and setting default values before sending to database
    fieldIn: function(field, value) {
      var type, default_value = null;
      if (Migrations.objectIsFieldDefinition(field)) {
        type = field.type;
        default_value = field.hasOwnProperty('value') ? field.value : null;
      } else {
        type = vartype(field);
        default_value = field;
      }
      if (type == 'json') return isSet(value) ? json.stringify(value, false) : default_value;
      if (type == 'string') return String.parse(value, default_value);
      if (type == 'number') return Number.parse(value, default_value);
      if (type == 'boolean') return isSet(value) ? !!value : default_value;
      if (type == 'date') return Date.fromString(value, default_value);
      return value;
    },
    //Allows for reconstructing objects from data received from database
    fieldOut: function(field, value) {
      var type = Migrations.objectIsFieldDefinition(field) ? field.type : vartype(field);
      if (type == 'json') {
        if (typeof value == 'string') {
          try {
            return json.parse(value);
          } catch(e) {}
        }
        return null;
      }
      return value;
    },
    transaction: function(proceed) {
      try {
        ActiveRecord.connection.executeSQL("BEGIN");
        proceed();
        ActiveRecord.connection.executeSQL("COMMIT")
      } catch (e) {
        ActiveRecord.connection.executeSQL("ROLLBACK");
        throw e;
      }
    }
  };
  Adapters.Auto = {};
  Adapters.Auto.connect = function() {
    var defaultAdapter;
    for (var n in Adapters) {
      if (Adapters[n] && Adapters[n].isDefault) defaultAdapter = Adapters[n];
    }
    if (defaultAdapter) {
      return defaultAdapter.connect.apply(defaultAdapter.connect, arguments);
    } else {
      throw new Error('No Database Adapter Specified and No Default Adapter Found');
    }
  };

  var Finders = {
    mergeOptions: function(field_name, value, options) {
      if (!options) options = {};
      options = Object.append({}, options);
      if (options.where) options.where[field_name] = value;
      else {
        options.where = {};
        options.where[field_name] = value
      }
      return options;
    },
    generateFindByField: function(klass, field_name) {
      klass["findBy" + lang.camelize(field_name, true)] = curry(function(klass, field_name, value, options) {
        return klass.find(Object.append(Finders.mergeOptions(field_name, value, options), {
          first: true
        }));
      }, klass, field_name);
    },
    generateFindAllByField: function(klass, field_name) {
      klass["findAllBy" + lang.camelize(field_name, true)] = curry(function(klass, field_name, value, options) {
        return klass.find(Object.append(Finders.mergeOptions(field_name, value, options), {
          all: true
        }));
      }, klass, field_name);
    }
  };
  ActiveRecord.Finders = Finders;

  var ResultSet = {};
  ResultSet.InstanceMethods = {
    reload: function(result_set, params, model) {
      result_set.length = 0;
      var new_response = model.find(Object.append({}, params));
      for (var i = 0; i < new_response.length; ++i) {
        result_set.push(new_response[i])
      }
    },
    toArray: function(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) {
        items.push(result_set[i].toObject());
      }
      return items;
    },
    toJSON: function(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) {
        items.push(result_set[i].toObject());
      }
      return items;
    }
  };

  var Relationships = {
    normalizeModelName: function(related_model_name) {
      var plural = lang.camelize(related_model_name, true);
      var singular = lang.camelize(lang.inflector.singularize(plural) || plural, true);
      return singular || plural;
    },
    normalizeForeignKey: function(foreign_key, related_model_name) {
      var plural = lang.underscore(related_model_name).toLowerCase();
      var singular = lang.inflector.singularize(plural) || plural;
      if (isSet(foreign_key) && foreign_key) {
        return foreign_key;
      } else {
        return singular + '_id';
      }
    }
  };
  ActiveRecord.Relationships = Relationships;

  ActiveRecord.ClassMethods.hasOne = function(related_model_name, options) {
    this.relationships.push(["hasOne", related_model_name, options]);
    if (related_model_name && related_model_name.modelName) related_model_name = related_model_name.modelName;
    if (!options) options = {};
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, Relationships.normalizeModelName(related_model_name));
    var class_methods = {};
    var instance_methods = {};
    instance_methods["get" + relationship_name] = curry(function(related_model_name, foreign_key) {
      var id = this.get(foreign_key);
      if (id) {
        return ActiveRecord.Models[related_model_name].get(id);
      } else {
        return false;
      }
    }, related_model_name, foreign_key);
    class_methods["build" + relationship_name] = instance_methods["build" + relationship_name] = curry(function(related_model_name, foreign_key, params) {
      return ActiveRecord.Models[related_model_name].build(params || {});
    }, related_model_name, foreign_key);
    instance_methods["create" + relationship_name] = curry(function(related_model_name, foreign_key, params) {
      var record = ActiveRecord.Models[related_model_name].create(params || {});
      if (this.get(this.constructor.primaryKeyName)) {
        this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName));
      }
      return record;
    }, related_model_name, foreign_key);
    Object.append(this.prototype, instance_methods);
    Object.append(this, class_methods);
    if (options.dependent) this.observe("afterDestroy", function(record) {
      var child = record["get" + relationship_name]();
      if (child) child.destroy();
    })
  };
  ActiveRecord.ClassMethods.hasMany = function(related_model_name, options) {
    this.relationships.push(["hasMany", related_model_name, options]);
    if (related_model_name && related_model_name.modelName) related_model_name = related_model_name.modelName;
    if (!options) options = {};
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var original_related_model_name = related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, Relationships.normalizeModelName(this.modelName));
    var class_methods = {};
    var instance_methods = {};
    if (options.through) {
      var through_model_name = Relationships.normalizeModelName(options.through);
      instance_methods["get" + relationship_name + "List"] = curry(function(through_model_name, related_model_name, foreign_key, params) {
        var related_list = this["get" + through_model_name + "List"]();
        var ids = [];
        var response = [];
        for (var i = 0; i < related_list.length; ++i) {
          response.push(related_list[i]["get" + related_model_name]());
        }
        return response;
      }, through_model_name, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "Count"] = curry(function(through_model_name, related_model_name, foreign_key, params) {
        if (!params) params = {};
        if (!params.where) params.where = {};
        params.where[foreign_key] = this.get(this.constructor.primaryKeyName);
        return ActiveRecord.Models[through_model_name].count(params);
      }, through_model_name, related_model_name, foreign_key)
    } else {
      instance_methods["destroy" + relationship_name] = class_methods["destroy" + relationship_name] = curry(function(related_model_name, foreign_key, params) {
        var record = ActiveRecord.Models[related_model_name].find(params && typeof params.get === "function" ? params.get(params.constructor.primaryKeyName) : params);
        if (record) {
          return record.destroy();
        } else {
          return false;
        }
      }, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "List"] = curry(function(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!id) return this.constructor.resultSetFromArray([]);
        if (!params) params = {};
        if (options.order && !("order" in params)) params.order = options.order;
        if (!params.where) params.where = {};
        params.where[foreign_key] = id;
        params.all = true;
        return ActiveRecord.Models[related_model_name].find(params);
      }, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "Count"] = curry(function(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!id) return 0;
        if (!params) params = {};
        if (!params.where) params.where = {};
        params.where[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].count(params);
      }, related_model_name, foreign_key);
      instance_methods["build" + relationship_name] = curry(function(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!params) params = {};
        params[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].build(params);
      }, related_model_name, foreign_key);
      instance_methods["create" + relationship_name] = curry(function(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!params) params = {};
        params[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].create(params);
      }, related_model_name, foreign_key)
    }
    Object.append(this.prototype, instance_methods);
    Object.append(this, class_methods);
    if (options.dependent) this.observe("afterDestroy", function(record) {
      var list = record["get" + relationship_name + "List"]();
      ActiveRecord.connection.log("Relationships.hasMany destroy " + list.length + " dependent " + related_model_name + " children of " + record.modelName);
      for (var i = 0; i < list.length; ++i) {
        list[i].destroy();
      }
    })
  };
  ActiveRecord.ClassMethods.belongsTo = function(related_model, options) {
    this.relationships.push(["belongsTo", related_model, options]);
    var related_model_name;
    if (related_model && related_model.modelName) {
      related_model_name = related_model.modelName;
    } else {
      related_model_name = related_model;
      related_model = ActiveRecord.Models[related_model_name];
    }
    if (!options) options = {};
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, related_model_name);
    //MODIFIED
    this.foreign_keys = this.foreign_keys || {};
    this.foreign_keys[foreign_key] = related_model;
    //END
    var class_methods = {};
    var instance_methods = {};
    instance_methods["get" + relationship_name] = curry(function(related_model_name, foreign_key) {
      var id = this.get(foreign_key);
      if (id) {
        return ActiveRecord.Models[related_model_name].get(id);
      } else {
        return false;
      }
    }, related_model_name, foreign_key);
    instance_methods["build" + relationship_name] = class_methods["build" + relationship_name] = curry(function(related_model_name, foreign_key, params) {
      var record = ActiveRecord.Models[related_model_name].build(params || {});
      if (options.counter) record[options.counter] = 1;
      return record;
    }, related_model_name, foreign_key);
    instance_methods["create" + relationship_name] = curry(function(related_model_name, foreign_key, params) {
      var record = this["build" + related_model_name](params);
      if (record.save() && this.get(this.constructor.primaryKeyName)) this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName));
      return record;
    }, related_model_name, foreign_key);
    Object.append(this.prototype, instance_methods);
    Object.append(this, class_methods);
    if (options.counter) {
      this.observe("afterDestroy", function(record) {
        var child = record["get" + relationship_name]();
        if (child) {
          var current_value = child.get(options.counter);
          if (typeof current_value == 'undefined') current_value = 0;
          child.updateAttribute(options.counter, Math.max(0, parseInt(current_value, 10) - 1));
        }
      });
      this.observe("afterCreate", function(record) {
        var child = record["get" + relationship_name]();
        if (child) {
          var current_value = child.get(options.counter);
          if (typeof current_value == 'undefined') current_value = 0;
          child.updateAttribute(options.counter, parseInt(current_value, 10) + 1);
        }
      })
    }
  };

  var Migrations = {
    migrations: {},
    migrate: function(target) {
      if (typeof target == 'undefined' || target === false) target = Migrations.max();
      Migrations.setup();
      ActiveRecord.connection.log("Migrations.migrate(" + target + ") start.");
      var current_version = Migrations.current();
      ActiveRecord.connection.log("Current schema version is " + current_version);
      var migrations, i, versions;
      Migrations.Meta.transaction(function() {
        if (target > current_version) {
          migrations = Migrations.collectAboveIndex(current_version, target);
          for (i = 0; i < migrations.length; ++i) {
            ActiveRecord.connection.log("Migrating up to version " + migrations[i][0]);
            migrations[i][1].up(Migrations.Schema);
            Migrations.Meta.create({
              version: migrations[i][0]
            })
          }
        } else if (target < current_version) {
          migrations = Migrations.collectBelowIndex(current_version, target);
          for (i = 0; i < migrations.length; ++i) {
            ActiveRecord.connection.log("Migrating down to version " + migrations[i][0]);
            migrations[i][1].down(Migrations.Schema)
          }
          versions = Migrations.Meta.find({
            all: true
          });
          for (i = 0; i < versions.length; ++i) if (versions[i].get("version") > target) versions[i].destroy();
          ActiveRecord.connection.log("Migrate to version " + target + " complete.")
        } else ActiveRecord.connection.log("Current schema version is current, no migrations were run.")
      }, function(e) {
        ActiveRecord.connection.log("Migration failed: " + e)
      });
      ActiveRecord.connection.log("Migrations.migrate(" + target + ") finished.")
    },
    current: function() {
      Migrations.setup();
      return Migrations.Meta.max("version") || 0;
    },
    max: function() {
      var max_val = 0;
      for (var key_name in Migrations.migrations) {
        key_name = parseInt(key_name, 10);
        if (key_name > max_val) max_val = key_name
      }
      return max_val;
    },
    setup: function() {
      if (!Migrations.Meta) {
        Migrations.Meta = ActiveRecord.create("schema_migrations", {
          version: 0
        });
        delete ActiveRecord.Models.SchemaMigrations
      }
    },
    collectBelowIndex: function(index, target) {
      return [[index, Migrations.migrations[index]]].concat(Migrations.collectMigrations(index, target + 1, "down"));
    },
    collectAboveIndex: function(index, target) {
      return Migrations.collectMigrations(index, target, "up");
    },
    collectMigrations: function(index, target, direction) {
      var keys = [];
      for (var key_name in Migrations.migrations) {
        key_name = parseInt(key_name, 10);
        if (direction === "up" && key_name > index || direction === "down" && key_name < index) {
          keys.push(key_name)
        }
      }
      keys = keys.sort();
      if (direction === "down") keys = keys.reverse();
      var migrations = [];
      for (var i = 0; i < keys.length; ++i) {
        if (direction == "down" && typeof target != 'undefined' && target > keys[i] || direction == 'up' && typeof target != 'undefined' && target < keys[i]) {
          break;
        }
        migrations.push([keys[i], Migrations.migrations[keys[i]]])
      }
      return migrations;
    },
    objectIsFieldDefinition: function(object) {
      return (object instanceof FieldDefinition && object.hasOwnProperty('type'));
    },
    Schema: {
      createTable: function(table_name, columns, foreign_keys) {
        return ActiveRecord.connection.createTable(table_name, columns, foreign_keys);
      },
      dropTable: function(table_name) {
        return ActiveRecord.connection.dropTable(table_name);
      },
      addColumn: function(table_name, column_name, data_type) {
        return ActiveRecord.connection.addColumn(table_name, column_name, data_type);
      },
      dropColumn: function(table_name, column_name) {
        return ActiveRecord.connection.dropColumn(table_name, column_name);
      }
    }
  };
  ActiveRecord.Migrations = Migrations;

  Object.append(ActiveRecord.ClassMethods, {
    addValidator: function(validator) {
      if (!this._validators) this._validators = [];
      this._validators.push(validator)
    },
    validatesPresenceOf: function(field, options) {
      options = Object.append({}, options);
      this.addValidator(function(isNew) {
        var value = this.get(field);
        if (!isSet(value) || value === '') {
          this.addError(options.message || field + ' is not present.', field)
        }
      })
    },
    validatesLengthOf: function(field, options) {
      options = Object.append({min: 1,  max: 9999}, options);
      this.addValidator(function(isNew) {
        var value = String(this.get(field));
        if (value.length < options.min) this.addError(options.message || field + ' is too short.', field);
        if (value.length > options.max) this.addError(options.message || field + ' is too long.', field)
      })
    },
    validatesUniquenessOf: function(field, options) {
      options = Object.append({}, options);
      this.addValidator(function(isNew) {
        var value = this.get(field), where = {}, unique;
        where[field] = value;
        var existing = this.constructor.find({where: where});
        if (isNew) {
          unique = !existing || !existing.length;
        } else {
          unique = !existing || !existing.length || (existing.length == 1 && existing[0].id == this.id);
        }
        if (!unique) {
          this.addError(options.message || field + ' is not unique.', field)
        }
      })
    }
  });
  Object.append(ActiveRecord.InstanceMethods, {
    addError: function(str, field) {
      var error = null;
      if (field) {
        error = [str, field];
        error.toString = function() {
          return field ? field + ": " + str : str;
        }
      } else error = str;
      this._errors.push(error)
    },
    isValid: function() {
      return this._errors.length === 0;
    },
    _validate: function(isNew) {
      this._errors = [];
      var validators = this.getValidators();
      for (var i = 0; i < validators.length; ++i) validators[i].call(this, isNew);
      if (typeof this.validate === "function") this.validate(isNew);
      ActiveRecord.connection.log("ActiveRecord.validate() " + String(this._errors.length === 0) + (this._errors.length > 0 ? ". Errors: " + String(this._errors) : ""));
      return this._errors.length === 0;
    },
    getValidators: function() {
      return this.constructor._validators || [];
    },
    getErrors: function() {
      return this._errors;
    }
  });

  /**
   * Adapter for SQLite
   *
   * Requires lib_sqlite
   *
   */
  Adapters.SQLite = Object.append(Object.append({}, Adapters.SQL), {
    createTable: function(table_name, columns, foreign_keys) {
      var keys = Object.keys(columns);
      var fragments = [];
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (columns[key].primaryKey) {
          var type = columns[key].type || "INTEGER";
          fragments.unshift(this.quoteIdentifier(key) + " " + type + " PRIMARY KEY")
        } else fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns))
      }
      return this.executeSQL("CREATE TABLE IF NOT EXISTS " + table_name + " (" + fragments.join(",") + ")");
    },
    dropColumn: function(table_name, column_name) {
      this.transaction(Function.prototype.bind.call(function() {
        var description = ActiveRecord.connection.iterableFromResultSet(ActiveRecord.connection.executeSQL('SELECT * FROM sqlite_master WHERE tbl_name = "' + table_name + '"')).iterate(0);
        var temp_table_name = "temp_" + table_name;
        ActiveRecord.execute(description["sql"].replace(new RegExp('^CREATE\\s+TABLE\\s+' + table_name), "CREATE TABLE " + temp_table_name).replace(new RegExp('(,|\\()\\s*' + column_name + '[\\s\\w]+(\\)|,)'), function() {
          return (args[1] == "(" ? "(" : "") + args[2];
        }));
        ActiveRecord.execute("INSERT INTO " + temp_table_name + " SELECT * FROM " + table_name);
        this.dropTable(table_name);
        this.renameTable(temp_table_name, table_name)
      }, this))
    }
  });

  /**
   * Adapter for Microsoft Access
   *
   * Requires lib_msaccess
   *
   */
  ActiveRecord.Adapters.Access = function() {
    Object.append(this, ActiveRecord.Adapters.InstanceMethods);
    Object.append(this, ActiveRecord.Adapters.SQL);
    Object.append(this, {
      quoteIdentifier: function(field) {
        return '[' + field + ']';
      },
      executeSQL: function(sql, errback) {
        var params = toArray(arguments).slice(1);
        ActiveRecord.connection.log("Adapters.Access.executeSQL: " + sql + " [" + params.join(',') + "]");
        var query = ActiveRecord.Adapters.Access.db.query(sql, params);
        try {
          return query.getAll();
        } catch(e) {
          if (e.message.match(/(cannot|could not) find( the)? (input|output) table/i)) {
            var m;
            if ((m = sql.match(/^INSERT INTO\s+(\S+)/i)) && ActiveRecord.autoMigrate) {
              var tableName = m[1].replace(/(^\[|\]$)/g, '');
              var model = ActiveRecord.ModelsByTableName[tableName];
              model.createTable();
              return query.getAll();
            }
          } else {
            throw new Error('ActiveRecord could not execute SQL statement' + e.message.replace(/[^.;]+/, ''));
          }
        }
      },
      getLastInsertedRowId: function() {
        var rec = ActiveRecord.Adapters.Access.db.query('SELECT @@IDENTITY AS [val]').getOne();
        return rec.val;
      },
      getDefaultColumnDefinitionFragmentFromType: function(type) {
        if (type == "string") return "TEXT(255)";
        if (type == "number") return "INT";
        if (type == "boolean") return "BIT";
        if (type == "date") return "DATETIME";
        return "MEMO";
      },
      createTable: function(table_name, columns, foreign_keys) {
        var keys = Object.keys(columns);
        var fragments = [];
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (columns[key].primaryKey) {
            var type = columns[key].type || "INTEGER IDENTITY(123,1) NOT NULL";
            fragments.unshift("[" + key + "] " + type + " CONSTRAINT [pk_" + key + "] PRIMARY KEY");
          } else {
            fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns));
          }
        }
        if (foreign_keys) {
          forEach(foreign_keys, function(foreign_key) {
            fragments.push("[" + foreign_key + "] INT");
          });
        }
        if (!columns.hasOwnProperty('created')) {
          fragments.push("[created] DATETIME");
        }
        if (!columns.hasOwnProperty('updated')) {
          fragments.push("[updated] DATETIME");
        }
        fragments.push("[_deleted] BIT");
        var result = this.executeSQL("CREATE TABLE [" + table_name + "] (" + fragments.join(", ") + ")");
        return result;
      },
      iterableFromResultSet: function(result) {
        result.iterate = ActiveRecord.Adapters.defaultResultSetIterator;
        return result;
      }
    });
  };
  ActiveRecord.Adapters.Access.connect = function(options) {
    if (!options) {
      options = {};
    }
    var msa = lib('msaccess');
    var name = options.database || app.cfg('defaults/database/name') || 'appdata';
    ActiveRecord.Adapters.Access.db = msa.open(name);
    return new ActiveRecord.Adapters.Access();
  };
  ActiveRecord.Adapters.Access.isDefault = true;

  return ActiveRecord;
}
