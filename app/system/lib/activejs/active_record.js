/*!
 * ActiveRecord
 *
 * ActiveRecord is an object relational mapper that shares a similar vocabulary to the Ruby
 * ActiveRecord implementation, but uses JavaScript.
 */
if (!this.lib_activerecord) this.lib_activerecord = lib_activerecord;
function lib_activerecord() {
  var ActiveSupport = lib("activesupport"), ActiveEvent = lib("activeevent"), ActiveRecord;

  ActiveRecord = {
    logging: false,
    autoMigrate: true,
    internalCounter: 0,
    Models: {},
    ClassMethods: {},
    InstanceMethods: {},
    create: function(options, fields, methods) {
      if (!ActiveRecord.connection) throw ActiveRecord.Errors.ConnectionNotEstablished.getErrorString();
      if (typeof options === "string") options = {
        tableName: options
      };
      var model = null;
      if (!options.modelName) {
        var model_name = ActiveSupport.camelize(ActiveSupport.Inflector.singularize(options.tableName) || options.tableName);
        options.modelName = model_name.charAt(0).toUpperCase() + model_name.substring(1)
      }
      model = ActiveRecord.Models[options.modelName] = function(data) {
        this._object = {};
        for (var key in data) this.set(key, data[key], true);
        this._errors = [];
        var fields = this.constructor.fields;
        for (var key in fields) {
          var field = fields[key];
          if (!field.primaryKey) {
            var value = ActiveRecord.connection.fieldOut(field, this.get(key));
            if (Migrations.objectIsFieldDefinition(value)) value = value.value;
            this.set(key, value)
          }
        }
        this._id = this.get(this.constructor.primaryKeyName);
        this.notify("afterInitialize", data)
      };
      model.modelName = options.modelName;
      model.tableName = options.tableName;
      model.primaryKeyName = "id";
      ActiveSupport.extend(model.prototype, ActiveRecord.InstanceMethods);
      if (typeof methods == "undefined") for (var method_name in fields) {
        if (typeof fields[method_name] == "function") {
          methods = fields;
          fields = null
        }
        break
      }
      if (methods && typeof methods !== "function") ActiveSupport.extend(model.prototype, methods);
      ActiveSupport.extend(model, ActiveRecord.ClassMethods);
      ActiveEvent.extend(model);
      if (!fields) fields = {};
      var custom_primary_key = false;
      for (var field_name in fields) {
        if (typeof fields[field_name] === "object" && fields[field_name].type && !("value" in fields[field_name])) fields[field_name].value = null;
        if (typeof fields[field_name] === "object" && fields[field_name].primaryKey) custom_primary_key = field_name
      }
      if (!custom_primary_key) fields["id"] = {
        primaryKey: true
      };
      model.fields = fields;
      if (custom_primary_key) model.primaryKeyName = custom_primary_key;
      ActiveSupport.extend(model.prototype, {
        modelName: model.modelName,
        tableName: model.tableName,
        primaryKeyName: model.primaryKeyName
      });
      for (var key in model.fields) {
        Finders.generateFindByField(model, key);
        Finders.generateFindAllByField(model, key)
      }
      model.get = model["findBy" + ActiveSupport.camelize(model.primaryKeyName, true)];
      model.relationships = [];
      if (ActiveRecord.autoMigrate) Migrations.Schema.createTable(options.tableName, ActiveSupport.clone(model.fields));
      return model
    }
  };
  ActiveRecord.define = ActiveRecord.create;
  ActiveEvent.extend(ActiveRecord);
  ActiveRecord.eventNames = ["afterInitialize", "afterFind", "beforeSave", "afterSave", "beforeCreate", "afterCreate", "beforeDestroy", "afterDestroy"];
  (function () {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) ActiveRecord.ClassMethods[ActiveRecord.eventNames[i]] = ActiveRecord.InstanceMethods[ActiveRecord.eventNames[i]] = ActiveSupport.curry(function(event_name, observer) {
      return this.observe(event_name, observer)
    }, ActiveRecord.eventNames[i])
  })();
  ActiveRecord.old_observe = ActiveRecord.observe;
  ActiveRecord.observe = function(event_name, observer) {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) if (ActiveRecord.eventNames[i] === event_name) {
      var observers = [];
      var model_observer;
      for (var model_name in ActiveRecord.Models) {
        model_observer = ActiveSupport.curry(observer, ActiveRecord.Models[model_name]);
        observers.push(model_observer);
        ActiveRecord.Models[model_name].observe(event_name, model_observer)
      }
      return observers
    }
    return ActiveRecord.old_observe(event_name, observer)
  };
  (function () {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) ActiveRecord[ActiveRecord.eventNames[i]] = ActiveSupport.curry(function(event_name, observer) {
      ActiveRecord.observe(event_name, observer)
    }, ActiveRecord.eventNames[i])
  })();
  var Errors = {
    ConnectionNotEstablished: ActiveSupport.createError("No ActiveRecord connection is active."),
    MethodDoesNotExist: ActiveSupport.createError("The requested method does not exist. %"),
    InvalidFieldType: ActiveSupport.createError("The field type does not exist: %")
  };
  ActiveRecord.Errors = Errors;
  ActiveSupport.extend(ActiveRecord.InstanceMethods, {
    set: function(key, value, suppress_notifications) {
      if (typeof this[key] !== "function") this[key] = value;
      this._object[key] = value;
      if (!suppress_notifications) if (this._observers && "set" in this._observers) this.notify("set", key, value)
    },
    get: function(key) {
      return this._object[key]
    },
    toObject: function(callback) {
      var response = ActiveSupport.clone(this._object);
      if (callback) response = callback(response);
      return response
    },
    keys: function() {
      var keys_array = [];
      for (var key_name in this._object) keys_array.push(key_name);
      return keys_array
    },
    values: function() {
      var values_array = [];
      for (var key_name in this._object) values_array.push(this._object[key_name]);
      return values_array
    },
    updateAttribute: function(key, value) {
      this.set(key, value);
      return this.save()
    },
    updateAttributes: function(attributes) {
      for (var key in attributes) this.set(key, attributes[key]);
      return this.save()
    },
    reload: function() {
      if (this._id === undefined) return false;
      var record = this.constructor.get(this._id);
      if (!record) return false;
      this._object = {};
      var raw = record.toObject();
      for (var key in raw) this.set(key, raw[key]);
      return true
    },
    save: function(force_created_mode) {
      this._validate();
      if (!this.isValid()) return false;
      for (var key in this.constructor.fields) if (!this.constructor.fields[key].primaryKey) this.set(key, ActiveRecord.connection.fieldIn(this.constructor.fields[key], this.get(key)), true);
      if (this.notify("beforeSave") === false) return false;
      if ("updated" in this._object) this.set("updated", ActiveSupport.dateFormat("yyyy-mm-dd HH:MM:ss"));
      if (force_created_mode || this._id === undefined) {
        if (this.notify("beforeCreate") === false) return false;
        if ("created" in this._object) this.set("created", ActiveSupport.dateFormat("yyyy-mm-dd HH:MM:ss"));
        ActiveRecord.connection.insertEntity(this.tableName, this.constructor.primaryKeyName, this.toObject());
        if (!this.get(this.constructor.primaryKeyName)) this.set(this.constructor.primaryKeyName, ActiveRecord.connection.getLastInsertedRowId());
        Synchronization.triggerSynchronizationNotifications(this, "afterCreate");
        this.notify("afterCreate")
      } else {
        if (this.notify("beforeUpdate") === false) return false;
        ActiveRecord.connection.updateEntity(this.tableName, this.constructor.primaryKeyName, this._id, this.toObject());
        this.notify("afterUpdate")
      }
      for (var key in this.constructor.fields) if (!this.constructor.fields[key].primaryKey) this.set(key, ActiveRecord.connection.fieldOut(this.constructor.fields[key], this.get(key)), true);
      this._id = this.get(this.constructor.primaryKeyName);
      Synchronization.triggerSynchronizationNotifications(this, "afterSave");
      this.notify("afterSave");
      return this
    },
    destroy: function() {
      if (this._id === undefined) return false;
      if (this.notify("beforeDestroy") === false) return false;
      ActiveRecord.connection.deleteEntity(this.tableName, this.constructor.primaryKeyName, this._id);
      Synchronization.triggerSynchronizationNotifications(this, "afterDestroy");
      if (this.notify("afterDestroy") === false) return false;
      return true
    },
    toSerializableObject: function(callback) {
      return this.toObject(callback)
    },
    toJSON: function(object_to_inject) {
      return ActiveSupport.extend(this.toSerializableObject(), object_to_inject || {})
    }
  });
  ActiveSupport.extend(ActiveRecord.ClassMethods, {
    find: function(params) {
      var result;
      if (params === 0) return false;
      if (!params) params = {};
      if (params.first && typeof params.first === "boolean" || (typeof params === "number" || typeof params === "string" && params.match(/^\d+$/)) && arguments.length == 1) {
        if (params.first) {
          params.limit = 1;
          result = ActiveRecord.connection.findEntities(this.tableName, params)
        } else result = ActiveRecord.connection.findEntitiesById(this.tableName, this.primaryKeyName, [params]);
        if (result && result.iterate && result.iterate(0)) return this.build(result.iterate(0));
        else return false
      } else {
        result = null;
        if (typeof params === "string" && !params.match(/^\d+$/)) result = ActiveRecord.connection.findEntities.apply(ActiveRecord.connection, arguments);
        else if (params && (typeof params == "object" && "length" in params && "slice" in params || (typeof params == "number" || typeof params == "string") && arguments.length > 1)) {
          var ids = (typeof params == "number" || typeof params == "string") && arguments.length > 1 ? ActiveSupport.arrayFrom(arguments) : params;
          result = ActiveRecord.connection.findEntitiesById(this.tableName, this.primaryKeyName, ids)
        } else result = ActiveRecord.connection.findEntities(this.tableName, params);
        var response = [];
        if (result) result.iterate(ActiveSupport.bind(function(row) {
          response.push(this.build(row))
        }, this));
        this.resultSetFromArray(response, params);
        this.notify("afterFind", response, params);
        return response
      }
    },
    destroy: function(id) {
      if (id == "all") {
        var instances = this.find({
          all: true
        });
        var responses = [];
        for (var i = 0; i < instances.length; ++i) responses.push(instances[i].destroy());
        return responses
      } else if (ActiveSupport.isArray(id)) {
        var responses = [];
        for (var i = 0; i < id.length; ++i) {
          var instance = this.get(id[i]);
          if (!instance) responses.push(false);
          else responses.push(instance.destroy())
        }
        return responses
      } else {
        var instance = this.get(id);
        if (!instance) return false;
        return instance.destroy()
      }
    },
    build: function(data) {
      if (ActiveSupport.isArray(data)) {
        var records = [];
        for (var i = 0; i < data.length; ++i) {
          ++ActiveRecord.internalCounter;
          var record = new this(ActiveSupport.clone(data[i]));
          record.internalCount = parseInt(Number(ActiveRecord.internalCounter), 10);
          records.push(record)
        }
        return records
      } else {
        ++ActiveRecord.internalCounter;
        var record = new this(ActiveSupport.clone(data));
        record.internalCount = parseInt(Number(ActiveRecord.internalCounter), 10);
        return record
      }
    },
    create: function(data) {
      if (ActiveSupport.isArray(data)) {
        var records = [];
        for (var i = 0; i < data.length; ++i) {
          var record = this.build(data[i]);
          record.save(true);
          records.push(record)
        }
        return records
      } else {
        var record = this.build(data);
        record.save(true);
        return record
      }
    },
    update: function(id, attributes) {
      if (ActiveSupport.isArray(id)) {
        var attributes_is_array = ActiveSupport.isArray(attributes);
        var results = [];
        for (var i = 0; i < id.length; ++i) {
          var record = this.get(id[i]);
          if (!record) results.push(false);
          else results.push(record.updateAttributes(attributes_is_array ? attributes[i] : attributes))
        }
        return results
      } else {
        var record = this.get(id);
        if (!record) return false;
        record.updateAttributes(attributes);
        return record
      }
    },
    updateAll: function(updates, conditions) {
      ActiveRecord.connection.updateMultitpleEntities(this.tableName, updates, conditions)
    },
    resultSetFromArray: function(result_set, params) {
      if (!params) params = {};
      for (var method_name in ResultSet.InstanceMethods) result_set[method_name] = ActiveSupport.curry(ResultSet.InstanceMethods[method_name], result_set, params, this);
      if (params.synchronize) Synchronization.synchronizeResultSet(this, params, result_set);
      return result_set
    }
  });
  ActiveSupport.extend(ActiveRecord.ClassMethods, {
    processCalculationParams: function(operation, params) {
      if (!params) params = {};
      if (typeof params === "string") params = {
        where: params
      };
      return params
    },
    performCalculation: function(operation, params, sql_fragment) {
      if (params && params.synchronize) return Synchronization.synchronizeCalculation(this, operation, params);
      else return ActiveRecord.connection.calculateEntities(this.tableName, this.processCalculationParams(operation, params), sql_fragment)
    },
    count: function(params) {
      return this.performCalculation("count", params, "COUNT(*)")
    },
    average: function(column_name, params) {
      return this.performCalculation("average", params, "AVG(" + column_name + ")")
    },
    max: function(column_name, params) {
      return this.performCalculation("max", params, "MAX(" + column_name + ")")
    },
    min: function(column_name, params) {
      return this.performCalculation("min", params, "MIN(" + column_name + ")")
    },
    sum: function(column_name, params) {
      return this.performCalculation("sum", params, "SUM(" + column_name + ")")
    },
    first: function() {
      return this.find({
        first: true
      })
    },
    last: function() {
      return this.find({
        first: true,
        order: this.primaryKeyName + " DESC"
      })
    }
  });
  var Adapters = {};
  ActiveRecord.adapters = [];
  ActiveRecord.connection = null;
  ActiveRecord.connect = function(adapter) {
    if (!adapter) {
      var connection = Adapters.Auto.connect.apply(Adapters.Auto, ActiveSupport.arrayFrom(arguments).slice(1));
      if (connection) ActiveRecord.connection = connection;
      ActiveRecord.adapters.push(ActiveRecord.connection.constructor)
    } else {
      var connection = adapter.connect.apply(adapter, ActiveSupport.arrayFrom(arguments).slice(1));
      if (connection) ActiveRecord.connection = connection;
      ActiveRecord.adapters.push(adapter)
    }
    ActiveEvent.extend(ActiveRecord.connection);
    if (!ActiveRecord.connection.preventConnectedNotification) ActiveRecord.notify("connected")
  };
  ActiveRecord.execute = function() {
    if (!ActiveRecord.connection) throw ActiveRecord.Errors.ConnectionNotEstablished.getErrorString();
    return ActiveRecord.connection.executeSQL.apply(ActiveRecord.connection, arguments)
  };
  ActiveRecord.escape = function(argument, supress_quotes) {
    var quote = supress_quotes ? "" : '"';
    return typeof argument == "number" ? argument : quote + String(argument).replace(/\"/g, '\\"').replace(/\\/g, "\\\\").replace(/\0/g, "\\0") + quote
  };
  ActiveRecord.transaction = function(proceed, error) {
    try {
      ActiveRecord.connection.transaction(proceed)
    } catch (e) {
      if (error) error(e);
      else throw e;
    }
  };
  ActiveRecord.ClassMethods.transaction = ActiveRecord.transaction;
  Adapters.defaultResultSetIterator = function(iterator) {
    if (typeof iterator === "number") {
      if (this[iterator]) {
        return ActiveSupport.clone(this[iterator]);
      } else {
        return false;
      }
    } else {
      for (var i = 0; i < this.length; ++i) {
        var row = ActiveSupport.clone(this[i]);
        iterator(row)
      }
    }
  };
  Adapters.InstanceMethods = {
    setValueFromFieldIfValueIsNull: function(field, value) {
      if (value === null || typeof value === "undefined") if (Migrations.objectIsFieldDefinition(field)) {
        var default_value = this.getDefaultValueFromFieldDefinition(field);
        if (typeof default_value === "undefined") throw Errors.InvalidFieldType.getErrorString(field ? field.type || "[object]" : "false");
        return field.value || default_value
      } else return field;
      return value
    },
    getColumnDefinitionFragmentFromKeyAndColumns: function(key, columns) {
      return this.quoteIdentifier(key) + (typeof columns[key] === "object" && typeof columns[key].type !== "undefined" ? columns[key].type : this.getDefaultColumnDefinitionFragmentFromValue(columns[key]))
    },
    getDefaultColumnDefinitionFragmentFromValue: function(value) {
      if (typeof value === "string") return "VARCHAR(255)";
      if (typeof value === "number") return "INT";
      if (typeof value == "boolean") return "TINYINT(1)";
      return "TEXT"
    },
    getDefaultValueFromFieldDefinition: function(field) {
      return field.value ? field.value : Migrations.fieldTypesWithDefaultValues[field.type ? field.type.replace(/\(.*/g, "").toLowerCase() : ""]
    },
    quoteIdentifier: function(name) {
      return '"' + name + '"'
    },
    log: function() {
      if (!ActiveRecord.logging) return;
      if (arguments[0]) arguments[0] = "ActiveRecord: " + arguments[0];
      return ActiveSupport.log.apply(ActiveSupport, arguments || {})
    }
  };
  ActiveRecord.Adapters = Adapters;
  Adapters.SQL = {
    schemaLess: false,
    insertEntity: function(table, primary_key_name, data) {
      var keys = ActiveSupport.keys(data).sort();
      var values = [];
      var args = [];
      var quoted_keys = [];
      for (var i = 0; i < keys.length; ++i) {
        args.push(data[keys[i]]);
        values.push("?");
        quoted_keys.push(this.quoteIdentifier(keys[i]))
      }
      args.unshift("INSERT INTO " + table + " (" + quoted_keys.join(",") + ") VALUES (" + values.join(",") + ")");
      var response = this.executeSQL.apply(this, args);
      var id = data[primary_key_name] || this.getLastInsertedRowId();
      var data_with_id = ActiveSupport.clone(data);
      data_with_id[primary_key_name] = id;
      this.notify("created", table, id, data_with_id);
      return response
    },
    updateMultitpleEntities: function(table, updates, conditions) {
      var args = [];
      if (typeof updates !== "string") {
        var values = [];
        var keys = ActiveSupport.keys(updates).sort();
        for (var i = 0; i < keys.length; ++i) {
          args.push(updates[keys[i]]);
          values.push(this.quoteIdentifier(keys[i]) + " = ?")
        }
        updates = values.join(",")
      }
      args.unshift("UPDATE " + table + " SET " + updates + this.buildWhereSQLFragment(conditions, args));
      return this.executeSQL.apply(this, args)
    },
    updateEntity: function(table, primary_key_name, id, data) {
      var keys = ActiveSupport.keys(data).sort();
      var args = [];
      var values = [];
      for (var i = 0; i < keys.length; ++i) {
        if (keys[i] == primary_key_name) continue;
        args.push(data[keys[i]]);
        values.push(this.quoteIdentifier(keys[i]) + " = ?")
      }
      args.push(id);
      args.unshift("UPDATE " + table + " SET " + values.join(",") + " WHERE " + this.quoteIdentifier(primary_key_name) + " = ?");
      var response = this.executeSQL.apply(this, args);
      this.notify("updated", table, id, data);
      return response
    },
    calculateEntities: function(table, params, operation) {
      var process_count_query_result = function(response) {
          if (!response) return 0;
          return parseInt(ActiveRecord.connection.iterableFromResultSet(response).iterate(0)["calculation"], 10)
          };
      var args = this.buildSQLArguments(table, params, operation);
      return process_count_query_result(this.executeSQL.apply(this, args))
    },
    deleteEntity: function(table, primary_key_name, id) {
      var args, response;
      if (id === "all") {
        args = ["DELETE FROM " + table];
        var ids = [];
        var ids_result_set = this.executeSQL("SELECT " + this.quoteIdentifier(primary_key_name) + " FROM " + table);
        if (!ids_result_set) return null;
        this.iterableFromResultSet(ids_result_set).iterate(function(row) {
          ids.push(row[primary_key_name])
        });
        response = this.executeSQL.apply(this, args);
        for (var i = 0; i < ids.length; ++i) this.notify("destroyed", table, ids[i]);
        return response
      } else {
        args = ["DELETE FROM " + table + " WHERE " + this.quoteIdentifier(primary_key_name) + " = ?", id];
        response = this.executeSQL.apply(this, args);
        this.notify("destroyed", table, id);
        return response
      }
    },
    findEntitiesById: function(table, primary_key_name, ids) {
      var response = this.executeSQL.apply(this, ["SELECT * FROM " + table + " WHERE " + this.quoteIdentifier(primary_key_name) + " IN (" + ids.join(",") + ")"]);
      if (!response) return false;
      else return ActiveRecord.connection.iterableFromResultSet(response)
    },
    findEntities: function(table, params) {
      var args;
      if (typeof table === "string" && !table.match(/^\d+$/) && typeof params != "object") args = arguments;
      else args = this.buildSQLArguments(table, params, false);
      var response = this.executeSQL.apply(this, args);
      if (!response) return false;
      else {
        var iterable_response = ActiveRecord.connection.iterableFromResultSet(response);
        if (params.callback) {
          var filtered_response = [];
          iterable_response.iterate(function (row) {
            if (params.callback(row)) filtered_response.push(row)
          });
          return filtered_response
        } else return iterable_response
      }
    },
    buildSQLArguments: function(table, params, calculation) {
      var args = [];
      var sql = "SELECT " + (calculation ? calculation + " AS calculation" : params.select ? params.select.join(",") : "*") + " FROM " + table + this.buildWhereSQLFragment(params.where, args) + (params.joins ? " " + params.joins : "") + (params.group ? " GROUP BY " + params.group : "") + (params.order ? " ORDER BY " + params.order : "") + (params.offset && params.limit ? " LIMIT " + params.offset + "," + params.limit : "") + (!params.offset && params.limit ? " LIMIT " + params.limit : "");
      args.unshift(sql);
      return args
    },
    buildWhereSQLFragment: function(fragment, args) {
      var where, keys, i;
      if (fragment && ActiveSupport.isArray(fragment)) {
        for (i = 1; i < fragment.length; ++i) args.push(fragment[i]);
        return " WHERE " + fragment[0]
      } else if (fragment && typeof fragment !== "string") {
        where = "";
        keys = ActiveSupport.keys(fragment);
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
      return where
    },
    dropTable: function(table_name) {
      return this.executeSQL("DROP TABLE IF EXISTS " + table_name)
    },
    addIndex: function(table_name, column_names, options) {},
    renameTable: function(old_table_name, new_table_name) {
      this.executeSQL("ALTER TABLE " + old_table_name + " RENAME TO " + new_table_name)
    },
    removeIndex: function(table_name, index_name) {},
    addColumn: function(table_name, column_name, data_type) {
      return this.executeSQL("ALTER TABLE " + table_name + " ADD COLUMN " + this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns))
    },
    fieldIn: function(field, value) {
      if (value && value instanceof Date) return ActiveSupport.dateFormat(value, "yyyy-mm-dd HH:MM:ss");
      if (Migrations.objectIsFieldDefinition(field)) field = this.getDefaultValueFromFieldDefinition(field);
      value = this.setValueFromFieldIfValueIsNull(field, value);
      if (typeof field === "string") return String(value);
      if (typeof field === "number") return String(value);
      if (typeof field === "boolean") return String(parseInt(Number(value), 10));
      if (typeof value === "object" && !Migrations.objectIsFieldDefinition(field)) return ActiveSupport.JSON.stringify(value)
    },
    fieldOut: function(field, value) {
      if (Migrations.objectIsFieldDefinition(field)) {
        if (typeof value == "string" && /date/.test(field.type.toLowerCase())) return ActiveSupport.dateFromDateTime(value);
        field = this.getDefaultValueFromFieldDefinition(field)
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      if (typeof field === "string") return value;
      if (typeof field === "boolean") {
        if (value === "0" || value === 0 || value === "false") value = false;
        return !!value
      }
      if (typeof field === "number") {
        if (typeof value === "number") return value;
        var t = ActiveSupport.trim(String(value));
        return t.length > 0 && !/[^0-9.]/.test(t) && /\.\d/.test(t) ? parseFloat(Number(value)) : parseInt(Number(value), 10)
      }
      if ((typeof value === "string" || typeof value === "object") && typeof field === "object" && (typeof field.length !== "undefined" || typeof field.type === "undefined")) if (typeof value === "string") return ActiveSupport.JSON.parse(value);
      else return value
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
      if (Adapters.hasOwnProperty(n) && Adapters[n] && Adapters[n].isDefault) defaultAdapter = Adapters[n];
    }
    if (defaultAdapter) {
      return defaultAdapter.connect.apply(defaultAdapter.connect, arguments);
    } else {
      throw new Error('No Database Adapter Specified and No Default Adapter Found');
    }
  };
  var WhereParser;
  var $c$ = 0,
      ERROR = -1,
      AND = $c$++,
      COMMA = $c$++,
      EQUAL = $c$++,
      FALSE = $c$++,
      GREATER_THAN = $c$++,
      GREATER_THAN_EQUAL = $c$++,
      IDENTIFIER = $c$++,
      IN = $c$++,
      LESS_THAN = $c$++,
      LESS_THAN_EQUAL = $c$++,
      LPAREN = $c$++,
      NOT_EQUAL = $c$++,
      NUMBER = $c$++,
      RPAREN = $c$++,
      STRING = $c$++,
      TRUE = $c$++,
      OR = $c$++,
      WHITESPACE = $c$++;
  var TypeMap = [];
  TypeMap[AND] = "AND";
  TypeMap[COMMA] = "COMMA";
  TypeMap[EQUAL] = "EQUAL";
  TypeMap[FALSE] = "FALSE";
  TypeMap[GREATER_THAN] = "GREATER_THAN";
  TypeMap[GREATER_THAN_EQUAL] = "GREATER_THAN_EQUAL";
  TypeMap[IDENTIFIER] = "IDENTIFIER";
  TypeMap[IN] = "IN";
  TypeMap[LESS_THAN] = "LESS_THAN";
  TypeMap[LESS_THAN_EQUAL] = "LESS_THAN_EQUAL";
  TypeMap[LPAREN] = "LPAREN";
  TypeMap[NOT_EQUAL] = "NOT_EQUAL";
  TypeMap[NUMBER] = "NUMBER";
  TypeMap[RPAREN] = "RPAREN";
  TypeMap[STRING] = "STRING";
  TypeMap[TRUE] = "TRUE";
  TypeMap[OR] = "OR";
  TypeMap[WHITESPACE] = "WHITESPACE";
  var OperatorMap = {
    "&&": AND,
    ",": COMMA,
    "||": OR,
    "<": LESS_THAN,
    "<=": LESS_THAN_EQUAL,
    "=": EQUAL,
    "!=": NOT_EQUAL,
    ">": GREATER_THAN,
    ">=": GREATER_THAN_EQUAL,
    "(": LPAREN,
    ")": RPAREN
  };
  var KeywordMap = {
    "and": AND,
    "false": FALSE,
    "in": IN,
    "or": OR,
    "true": TRUE
  };
  var WHITESPACE_PATTERN = /^\s+/;
  var IDENTIFIER_PATTERN = /^[a-zA-Z\_][a-zA-Z\_]*/;
  var OPERATOR_PATTERN = /^(?:&&|\|\||<=|<|=|!=|>=|>|,|\(|\))/i;
  var KEYWORD_PATTERN = /^(true|or|in|false|and)\b/i;
  var STRING_PATTERN = /^(?:'(\\.|[^'])*'|"(\\.|[^"])*")/;
  var NUMBER_PATTERN = /^[1-9][0-9]*/;
  var currentLexeme;

  function Lexeme(type, text) {
    this.type = type;
    this.typeName = null;
    this.text = text
  }
  Lexeme.prototype.toString = function() {
    if (this.typeName) return "[" + this.typeName + "]~" + this.text + "~";
    else return "[" + this.type + "]~" + this.text + "~"
  };

  function WhereLexer() {
    this.setSource(null)
  }
  WhereLexer.prototype.setSource = function(source) {
    this.source = source;
    this.offset = 0;
    this.length = source !== null ? source.length : 0;
    currentLexeme = null
  };
  WhereLexer.prototype.advance = function() {
    var inWhitespace = true;
    var result = null;
    while (inWhitespace) {
      inWhitespace = false;
      result = null;
      if (this.offset < this.length) {
        var match, text, type;
        if ((match = WHITESPACE_PATTERN.exec(this.source)) !== null) {
          result = new Lexeme(WHITESPACE, match[0]);
          inWhitespace = true
        } else if ((match = OPERATOR_PATTERN.exec(this.source)) !== null) {
          text = match[0];
          type = OperatorMap[text.toLowerCase()];
          result = new Lexeme(type, text)
        } else if ((match = KEYWORD_PATTERN.exec(this.source)) !== null) {
          text = match[0];
          type = KeywordMap[text.toLowerCase()];
          result = new Lexeme(type, text)
        } else if ((match = STRING_PATTERN.exec(this.source)) !== null) result = new Lexeme(STRING, match[0]);
        else if ((match = NUMBER_PATTERN.exec(this.source)) !== null) result = new Lexeme(NUMBER, match[0]);
        else if ((match = IDENTIFIER_PATTERN.exec(this.source)) !== null) result = new Lexeme(IDENTIFIER, match[0]);
        else result = new Lexeme(ERROR, this.source);
        if (TypeMap[result.type]) result.typeName = TypeMap[result.type];
        var length = result.text.length;
        this.offset += length;
        this.source = this.source.substring(length)
      }
    }
    currentLexeme = result;
    return result
  };

  function BinaryOperatorNode(lhs, operator, rhs) {
    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs
  }
  BinaryOperatorNode.prototype.execute = function(row, functionProvider) {
    var result = null;
    var lhs = this.lhs.execute(row, functionProvider);
    if (this.operator == IN) {
      result = false;
      for (var i = 0; i < this.rhs.length; i++) {
        var rhs = this.rhs[i].execute(row, functionProvider);
        if (lhs == rhs) {
          result = true;
          break
        }
      }
    } else {
      var rhs = this.rhs.execute(row, functionProvider);
      switch (this.operator) {
      case EQUAL:
        result = lhs === rhs;
        break;
      case NOT_EQUAL:
        result = lhs !== rhs;
        break;
      case LESS_THAN:
        result = lhs < rhs;
        break;
      case LESS_THAN_EQUAL:
        result = lhs <= rhs;
        break;
      case GREATER_THAN:
        result = lhs > rhs;
        break;
      case GREATER_THAN_EQUAL:
        result = lhs >= rhs;
        break;
      case AND:
        result = lhs && rhs;
        break;
      case OR:
        result = lhs || rhs;
        break;
      default:
        throw new Error("Unknown operator type: " + this.operator);
      }
    }
    return result
  };

  function IdentifierNode(identifier) {
    this.identifier = identifier
  }
  IdentifierNode.prototype.execute = function(row, functionProvider) {
    return row[this.identifier]
  };

  function FunctionNode(name, args) {
    this.name = name;
    this.args = args
  }
  FunctionNode.prototype.execute = function(row, functionProvider) {
    var args = new Array(this.args.length);
    for (var i = 0; i < this.args.length; i++) args[i] = this.args[i].execute(row, functionProvider);
    return functionProvider(this.name, row, args)
  };

  function ScalarNode(value) {
    this.value = value
  }
  ScalarNode.prototype.execute = function(row, functionProvider) {
    return this.value
  };
  WhereParser = function() {
    this._lexer = new WhereLexer
  };
  WhereParser.prototype.parse = function(source) {
    var result = null;
    currentLexeme = null;
    this._lexer.setSource(source);
    this._lexer.advance();
    while (currentLexeme !== null) switch (currentLexeme.type) {
    case IDENTIFIER:
    case FALSE:
    case LPAREN:
    case NUMBER:
    case STRING:
    case TRUE:
      result = this.parseInExpression();
      break;
    default:
      throw new Error("Unrecognized starting token in where-clause:" + this._lexer.currentLexeme);
    }
    return result
  };
  WhereParser.prototype.parseInExpression = function() {
    var result = this.parseOrExpression();
    while (currentLexeme !== null && currentLexeme.type === IN) {
      this._lexer.advance();
      var rhs = [];
      if (currentLexeme !== null && currentLexeme.type === LPAREN) {
        this._lexer.advance();
        while (currentLexeme !== null) {
          rhs.push(this.parseOrExpression());
          if (currentLexeme !== null && currentLexeme.type === COMMA) this._lexer.advance();
          else break
        }
        if (currentLexeme !== null && currentLexeme.type === RPAREN) {
          this._lexer.advance();
          result = new BinaryOperatorNode(result, IN, rhs)
        } else throw new Error("'in' list did not end with a right parenthesis." + currentLexeme);
      } else throw new Error("'in' list did not start with a left parenthesis");
    }
    return result
  };
  WhereParser.prototype.parseOrExpression = function() {
    var result = this.parseAndExpression();
    while (currentLexeme !== null && currentLexeme.type === OR) {
      this._lexer.advance();
      var rhs = this.parseAndExpression();
      result = new BinaryOperatorNode(result, OR, rhs)
    }
    return result
  };
  WhereParser.prototype.parseAndExpression = function() {
    var result = this.parseEqualityExpression();
    while (currentLexeme !== null && currentLexeme.type === AND) {
      this._lexer.advance();
      var rhs = this.parseEqualityExpression();
      result = new BinaryOperatorNode(result, AND, rhs)
    }
    return result
  };
  WhereParser.prototype.parseEqualityExpression = function() {
    var result = this.parseRelationalExpression();
    if (currentLexeme !== null) {
      var type = currentLexeme.type;
      switch (type) {
      case EQUAL:
      case NOT_EQUAL:
        this._lexer.advance();
        var rhs = this.parseRelationalExpression();
        result = new BinaryOperatorNode(result, type, rhs);
        break
      }
    }
    return result
  };
  WhereParser.prototype.parseRelationalExpression = function () {
    var result = this.parseMemberExpression();
    if (currentLexeme !== null) {
      var type = currentLexeme.type;
      switch (type) {
      case LESS_THAN:
      case LESS_THAN_EQUAL:
      case GREATER_THAN:
      case GREATER_THAN_EQUAL:
        this._lexer.advance();
        var rhs = this.parseMemberExpression();
        result = new BinaryOperatorNode(result, type, rhs);
        break
      }
    }
    return result
  };
  WhereParser.prototype.parseMemberExpression = function() {
    var result = null;
    if (currentLexeme !== null) switch (currentLexeme.type) {
    case IDENTIFIER:
      result = new IdentifierNode(currentLexeme.text);
      this._lexer.advance();
      if (currentLexeme !== null && currentLexeme.type === LPAREN) {
        var name = result.identifier;
        var args = [];
        this._lexer.advance();
        while (currentLexeme !== null && currentLexeme.type !== RPAREN) {
          args.push(this.parseOrExpression());
          if (currentLexeme !== null && currentLexeme.type === COMMA) this._lexer.advance()
        }
        if (currentLexeme !== null) {
          this._lexer.advance();
          result = new FunctionNode(name, args)
        } else throw new Error("Function argument list was not closed with a right parenthesis.");
      }
      break;
    case TRUE:
      result = new ScalarNode(true);
      this._lexer.advance();
      break;
    case FALSE:
      result = new ScalarNode(false);
      this._lexer.advance();
      break;
    case NUMBER:
      result = new ScalarNode(currentLexeme.text - 0);
      this._lexer.advance();
      break;
    case STRING:
      var text = currentLexeme.text;
      result = new ScalarNode(text.substring(1, text.length - 1));
      this._lexer.advance();
      break;
    case LPAREN:
      this._lexer.advance();
      result = this.parseOrExpression();
      if (currentLexeme !== null && currentLexeme.type === RPAREN) this._lexer.advance();
      else throw new Error("Missing closing right parenthesis: " + currentLexeme);
      break
    }
    return result
  };
  ActiveRecord.WhereParser = WhereParser;
  var Finders = {
    mergeOptions: function(field_name, value, options) {
      if (!options) options = {};
      options = ActiveSupport.clone(options);
      if (options.where) options.where[field_name] = value;
      else {
        options.where = {};
        options.where[field_name] = value
      }
      return options
    },
    generateFindByField: function(klass, field_name) {
      klass["findBy" + ActiveSupport.camelize(field_name, true)] = ActiveSupport.curry(function(klass, field_name, value, options) {
        return klass.find(ActiveSupport.extend(Finders.mergeOptions(field_name, value, options), {
          first: true
        }))
      }, klass, field_name)
    },
    generateFindAllByField: function(klass, field_name) {
      klass["findAllBy" + ActiveSupport.camelize(field_name, true)] = ActiveSupport.curry(function(klass, field_name, value, options) {
        return klass.find(ActiveSupport.extend(Finders.mergeOptions(field_name, value, options), {
          all: true
        }))
      }, klass, field_name)
    }
  };
  ActiveRecord.Finders = Finders;
  var Indicies = {
    initializeIndicies: function(storage) {
      var model_name, model, table_name, index_name, index, index_callbacks, id;
      for (model_name in ActiveRecord.Models) {
        model = ActiveRecord.Models[model_name];
        if (model.indexingCallbacks) {
          table_name = model.tableName;
          for (index_name in model.indexingCallbacks) {
            index = model.indexed[index_name];
            index_callbacks = model.indexingCallbacks[index_name];
            for (id in storage[table_name]) index_callbacks.afterSave(index, storage[table_name][id])
          }
        }
      }
    }
  };
  ActiveRecord.ClassMethods.addIndex = function(name, index, callbacks) {
    if (!callbacks) if (typeof index == "string") {
      var key_name = index;
      index = {};
      callbacks = {
        afterSave: function(index, item) {
          index[item[key_name]] = item.id
        },
        afterDestroy: function(index, item) {
          delete index[item[key_name]]
        }
      }
    } else {
      callbacks = index;
      index = {}
    }
    if (!this.indexed) this.indexed = {};
    if (!this.indexingCallbacks) this.indexingCallbacks = {};
    if (!this.indexingCallbackObservers) this.indexingCallbackObservers = {};
    this.indexed[name] = index || {};
    this.indexingCallbacks[name] = callbacks;
    this.indexingCallbackObservers[name] = {};
    this.indexingCallbackObservers[name].afterSave = this.observe("afterSave", ActiveSupport.bind(function(instance) {
      callbacks.afterSave(this.indexed[name], instance.toObject())
    }, this));
    this.indexingCallbackObservers[name].afterDestroy = this.observe("afterDestroy", ActiveSupport.bind(function(instance) {
      callbacks.afterDestroy(this.indexed[name], instance.toObject())
    }, this))
  };
  ActiveRecord.ClassMethods.removeIndex = function(name) {
    this.stopObserving("afterSave", this.indexingCallbackObservers[name].afterSave);
    this.stopObserving("afterDestroy", this.indexingCallbackObservers[name].afterDestroy);
    delete this.indexingCallbacks[name];
    delete this.indexed[name]
  };
  ActiveRecord.Indicies = Indicies;
  var ResultSet = {};
  ResultSet.InstanceMethods = {
    reload: function(result_set, params, model) {
      result_set.length = 0;
      var new_response = model.find(ActiveSupport.extend(ActiveSupport.clone(params), {
        synchronize: false
      }));
      for (var i = 0; i < new_response.length; ++i) result_set.push(new_response[i])
    },
    toArray: function(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) items.push(result_set[i].toObject());
      return items
    },
    toJSON: function(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) items.push(result_set[i].toSerializableObject());
      return items
    }
  };
  var Relationships = {
    normalizeModelName: function (related_model_name) {
      var plural = ActiveSupport.camelize(related_model_name, true);
      var singular = ActiveSupport.camelize(ActiveSupport.Inflector.singularize(plural) || plural, true);
      return singular || plural
    },
    normalizeForeignKey: function (foreign_key, related_model_name) {
      var plural = ActiveSupport.underscore(related_model_name).toLowerCase();
      var singular = ActiveSupport.Inflector.singularize(plural) || plural;
      if (!foreign_key || typeof foreign_key === "undefined") return (singular || plural) + "_id";
      else return foreign_key
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
    instance_methods["get" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key) {
      var id = this.get(foreign_key);
      if (id) return ActiveRecord.Models[related_model_name].get(id);
      else return false
    }, related_model_name, foreign_key);
    class_methods["build" + relationship_name] = instance_methods["build" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
      return ActiveRecord.Models[related_model_name].build(params || {})
    }, related_model_name, foreign_key);
    instance_methods["create" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
      var record = ActiveRecord.Models[related_model_name].create(params || {});
      if (this.get(this.constructor.primaryKeyName)) this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName));
      return record
    }, related_model_name, foreign_key);
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    if (options.dependent) this.observe("afterDestroy", function(record) {
      var child = record["get" + relationship_name]();
      if (child) child.destroy()
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
      instance_methods["get" + relationship_name + "List"] = ActiveSupport.curry(function(through_model_name, related_model_name, foreign_key, params) {
        var related_list = this["get" + through_model_name + "List"]();
        var ids = [];
        var response = [];
        for (var i = 0; i < related_list.length; ++i) response.push(related_list[i]["get" + related_model_name]());
        return response
      }, through_model_name, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "Count"] = ActiveSupport.curry(function(through_model_name, related_model_name, foreign_key, params) {
        if (!params) params = {};
        if (!params.where) params.where = {};
        params.where[foreign_key] = this.get(this.constructor.primaryKeyName);
        return ActiveRecord.Models[through_model_name].count(params)
      }, through_model_name, related_model_name, foreign_key)
    } else {
      instance_methods["destroy" + relationship_name] = class_methods["destroy" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
        var record = ActiveRecord.Models[related_model_name].find(params && typeof params.get === "function" ? params.get(params.constructor.primaryKeyName) : params);
        if (record) return record.destroy();
        else return false
      }, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "List"] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!id) return this.constructor.resultSetFromArray([]);
        if (!params) params = {};
        if (options.order && !("order" in params)) params.order = options.order;
        if (options.synchronize && !("synchronize" in params)) params.synchronize = options.synchronize;
        if (!params.where) params.where = {};
        params.where[foreign_key] = id;
        params.all = true;
        return ActiveRecord.Models[related_model_name].find(params)
      }, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "Count"] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!id) return 0;
        if (!params) params = {};
        if (!params.where) params.where = {};
        params.where[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].count(params)
      }, related_model_name, foreign_key);
      instance_methods["build" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!params) params = {};
        params[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].build(params)
      }, related_model_name, foreign_key);
      instance_methods["create" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!params) params = {};
        params[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].create(params)
      }, related_model_name, foreign_key)
    }
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    if (options.dependent) this.observe("afterDestroy", function(record) {
      var list = record["get" + relationship_name + "List"]();
      ActiveRecord.connection.log("Relationships.hasMany destroy " + list.length + " dependent " + related_model_name + " children of " + record.modelName);
      for (var i = 0; i < list.length; ++i) list[i].destroy()
    })
  };
  ActiveRecord.ClassMethods.belongsTo = function(related_model_name, options) {
    this.relationships.push(["belongsTo", related_model_name, options]);
    if (related_model_name && related_model_name.modelName) related_model_name = related_model_name.modelName;
    if (!options) options = {};
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, related_model_name);
    var class_methods = {};
    var instance_methods = {};
    instance_methods["get" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key) {
      var id = this.get(foreign_key);
      if (id) return ActiveRecord.Models[related_model_name].get(id);
      else return false
    }, related_model_name, foreign_key);
    instance_methods["build" + relationship_name] = class_methods["build" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
      var record = ActiveRecord.Models[related_model_name].build(params || {});
      if (options.counter) record[options.counter] = 1;
      return record
    }, related_model_name, foreign_key);
    instance_methods["create" + relationship_name] = ActiveSupport.curry(function(related_model_name, foreign_key, params) {
      var record = this["build" + related_model_name](params);
      if (record.save() && this.get(this.constructor.primaryKeyName)) this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName));
      return record
    }, related_model_name, foreign_key);
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    if (options.counter) {
      this.observe("afterDestroy", function(record) {
        var child = record["get" + relationship_name]();
        if (child) {
          var current_value = child.get(options.counter);
          if (typeof current_value === "undefined") current_value = 0;
          child.updateAttribute(options.counter, Math.max(0, parseInt(current_value, 10) - 1))
        }
      });
      this.observe("afterCreate", function(record) {
        var child = record["get" + relationship_name]();
        if (child) {
          var current_value = child.get(options.counter);
          if (typeof current_value === "undefined") current_value = 0;
          child.updateAttribute(options.counter, parseInt(current_value, 10) + 1)
        }
      })
    }
  };
  var Migrations = {
    fieldTypesWithDefaultValues: {
      "tinyint": 0,
      "smallint": 0,
      "mediumint": 0,
      "int": 0,
      "integer": 0,
      "bigint": 0,
      "float": 0,
      "double": 0,
      "double precision": 0,
      "real": 0,
      "decimal": 0,
      "numeric": 0,
      "date": "",
      "datetime": "",
      "timestamp": "",
      "time": "",
      "year": "",
      "char": "",
      "varchar": "",
      "tinyblob": "",
      "tinytext": "",
      "blob": "",
      "text": "",
      "mediumtext": "",
      "mediumblob": "",
      "longblob": "",
      "longtext": "",
      "enum": "",
      "set": ""
    },
    migrations: {},
    migrate: function(target) {
      if (typeof target === "undefined" || target === false) target = Migrations.max();
      Migrations.setup();
      ActiveRecord.connection.log("Migrations.migrate(" + target + ") start.");
      var current_version = Migrations.current();
      ActiveRecord.connection.log("Current schema version is " + current_version);
      var migrations, i, versions;
      Migrations.Meta.transaction(function () {
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
      }, function (e) {
        ActiveRecord.connection.log("Migration failed: " + e)
      });
      ActiveRecord.connection.log("Migrations.migrate(" + target + ") finished.")
    },
    current: function() {
      Migrations.setup();
      return Migrations.Meta.max("version") || 0
    },
    max: function() {
      var max_val = 0;
      for (var key_name in Migrations.migrations) {
        key_name = parseInt(key_name, 10);
        if (key_name > max_val) max_val = key_name
      }
      return max_val
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
      return [[index, Migrations.migrations[index]]].concat(Migrations.collectMigrations(index, target + 1, "down"))
    },
    collectAboveIndex: function(index, target) {
      return Migrations.collectMigrations(index, target, "up")
    },
    collectMigrations: function(index, target, direction) {
      var keys = [];
      for (var key_name in Migrations.migrations) {
        key_name = parseInt(key_name, 10);
        if (direction === "up" && key_name > index || direction === "down" && key_name < index) keys.push(key_name)
      }
      keys = keys.sort();
      if (direction === "down") keys = keys.reverse();
      var migrations = [];
      for (var i = 0; i < keys.length; ++i) {
        if (direction === "down" && typeof target !== "undefined" && target > keys[i] || direction === "up" && typeof target !== "undefined" && target < keys[i]) break;
        migrations.push([keys[i], Migrations.migrations[keys[i]]])
      }
      return migrations
    },
    objectIsFieldDefinition: function(object) {
      return typeof object === "object" && ActiveSupport.keys(object).length === 2 && "type" in object && "value" in object
    },
    Schema: {
      createTable: function(table_name, columns) {
        return ActiveRecord.connection.createTable(table_name, columns)
      },
      dropTable: function(table_name) {
        return ActiveRecord.connection.dropTable(table_name)
      },
      addColumn: function(table_name, column_name, data_type) {
        return ActiveRecord.connection.addColumn(table_name, column_name, data_type)
      },
      dropColumn: function(table_name, column_name) {
        return ActiveRecord.connection.dropColumn(table_name, column_name)
      },
      addIndex: function(table_name, column_names, options) {
        return ActiveRecord.connection.addIndex(table_name, column_names, options)
      },
      removeIndex: function(table_name, index_name) {
        return ActiveRecord.connection.removeIndex(table_name, index_name)
      }
    }
  };
  ActiveRecord.Migrations = Migrations;
  ActiveSupport.extend(ActiveRecord.ClassMethods, {
    addValidator: function(validator) {
      if (!this._validators) this._validators = [];
      this._validators.push(validator)
    },
    validatesPresenceOf: function(field, options) {
      options = ActiveSupport.extend({}, options || {});
      this.addValidator(function() {
        if (!this.get(field) || this.get(field) === "") this.addError(options.message || field + " is not present.", field)
      })
    },
    validatesLengthOf: function(field, options) {
      options = ActiveSupport.extend({
        min: 1,
        max: 9999
      }, options || {});
      this.addValidator(function() {
        var value = String(this.get(field));
        if (value.length < options.min) this.addError(options.message || field + " is too short.", field);
        if (value.length > options.max) this.addError(options.message || field + " is too long.", field)
      })
    }
  });
  ActiveSupport.extend(ActiveRecord.InstanceMethods, {
    addError: function(str, field) {
      var error = null;
      if (field) {
        error = [str, field];
        error.toString = function() {
          return field ? field + ": " + str : str
        }
      } else error = str;
      this._errors.push(error)
    },
    isValid: function() {
      return this._errors.length === 0
    },
    _validate: function() {
      this._errors = [];
      var validators = this.getValidators();
      for (var i = 0; i < validators.length; ++i) validators[i].apply(this);
      if (typeof this.validate === "function") this.validate();
      ActiveRecord.connection.log("ActiveRecord.validate() " + String(this._errors.length === 0) + (this._errors.length > 0 ? ". Errors: " + String(this._errors) : ""));
      return this._errors.length === 0
    },
    getValidators: function() {
      return this.constructor._validators || []
    },
    getErrors: function() {
      return this._errors
    }
  });
  ActiveRecord.asynchronous = false;
  var Synchronization = {};
  Synchronization.calculationNotifications = {};
  Synchronization.resultSetNotifications = {};
  Synchronization.notifications = {};
  Synchronization.setupNotifications = function(record) {
    if (!record.get(record.constructor.primaryKeyName)) return false;
    if (!Synchronization.notifications[record.tableName]) Synchronization.notifications[record.tableName] = {};
    if (!Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]]) Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]] = {};
    return true
  };
  Synchronization.triggerSynchronizationNotifications = function(record, event_name) {
    var found_records, internal_count_id;
    if (!Synchronization.setupNotifications(record)) return false;
    if (event_name === "afterSave") {
      found_records = Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]];
      for (internal_count_id in found_records) if (internal_count_id !== record.internalCount) {
        var found_record = found_records[internal_count_id];
        var keys = found_record.keys();
        for (var i = 0; i < keys.length; ++i) {
          var key_name = keys[i];
          found_record.set(key_name, record.get(key_name))
        }
        found_record.notify("synchronization:afterSave")
      }
    } else if (event_name === "afterDestroy" || event_name === "afterCreate") {
      if (Synchronization.calculationNotifications[record.tableName]) for (var synchronized_calculation_count in Synchronization.calculationNotifications[record.tableName]) Synchronization.calculationNotifications[record.tableName][synchronized_calculation_count]();
      if (Synchronization.resultSetNotifications[record.tableName]) for (var synchronized_result_set_count in Synchronization.resultSetNotifications[record.tableName]) {
        var old_result_set = Synchronization.resultSetNotifications[record.tableName][synchronized_result_set_count].resultSet;
        var new_params = ActiveSupport.clone(Synchronization.resultSetNotifications[record.tableName][synchronized_result_set_count].params);
        var new_result_set = record.constructor.find(ActiveSupport.extend(new_params, {
          synchronize: false
        }));
        var splices = Synchronization.spliceArgumentsFromResultSetDiff(old_result_set, new_result_set, event_name);
        for (var x = 0; x < splices.length; ++x) {
          if (event_name == "afterCreate") {
            var to_synchronize = splices[x].slice(2);
            for (var s = 0; s < to_synchronize.length; ++s) to_synchronize[s].synchronize()
          }
          old_result_set.splice.apply(old_result_set, splices[x])
        }
      }
      if (event_name === "afterDestroy") {
        found_records = Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]];
        for (internal_count_id in found_records) if (internal_count_id !== record.internalCount) {
          found_records[internal_count_id].notify("synchronization:afterDestroy");
          Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]][internal_count_id] = null;
          delete Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]][internal_count_id]
        }
      }
    }
  };
  ActiveSupport.extend(ActiveRecord.InstanceMethods, {
    synchronize: function() {
      if (!this.isSynchronized) {
        this.isSynchronized = true;
        Synchronization.setupNotifications(this);
        Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount] = this
      }
    },
    stop: function() {
      Synchronization.setupNotifications(this);
      Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount] = null;
      delete Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount]
    }
  });
  Synchronization.synchronizedCalculationCount = 0;
  Synchronization.synchronizeCalculation = function(klass, operation, params) {
    ++Synchronization.synchronizedCalculationCount;
    var callback = params.synchronize;
    var callback_params = ActiveSupport.clone(params);
    delete callback_params.synchronize;
    if (!Synchronization.calculationNotifications[klass.tableName]) Synchronization.calculationNotifications[klass.tableName] = {};
    Synchronization.calculationNotifications[klass.tableName][Synchronization.synchronizedCalculationCount] = function(klass, operation, params, callback) {
      return function() {
        callback(klass[operation](callback_params))
      }
    }(klass, operation, params, callback);
    Synchronization.calculationNotifications[klass.tableName][Synchronization.synchronizedCalculationCount]();
    return function(table_name, synchronized_calculation_count) {
      return function() {
        Synchronization.calculationNotifications[table_name][synchronized_calculation_count] = null;
        delete Synchronization.calculationNotifications[table_name][synchronized_calculation_count]
      }
    }(klass.tableName, Synchronization.synchronizedCalculationCount)
  };
  Synchronization.synchronizedResultSetCount = 0;
  Synchronization.synchronizeResultSet = function(klass, params, result_set) {
    ++Synchronization.synchronizedResultSetCount;
    if (!Synchronization.resultSetNotifications[klass.tableName]) Synchronization.resultSetNotifications[klass.tableName] = {};
    Synchronization.resultSetNotifications[klass.tableName][Synchronization.synchronizedResultSetCount] = {
      resultSet: result_set,
      params: params
    };
    for (var i = 0; i < result_set.length; ++i) result_set[i].synchronize();
    result_set.stop = function(table_name, synchronized_result_set_count) {
      return function() {
        for (var i = 0; i < this.length; ++i) this[i].stop();
        Synchronization.resultSetNotifications[table_name][synchronized_result_set_count] = null;
        delete Synchronization.resultSetNotifications[table_name][synchronized_result_set_count]
      }
    }(klass.tableName, Synchronization.synchronizedResultSetCount)
  };
  Synchronization.spliceArgumentsFromResultSetDiff = function(a, b, event_name) {
    var diffs = [];
    if (event_name === "afterCreate") for (var i = 0; i < b.length; ++i) {
      if (!a[i] || a[i] && a[i][a[i].constructor.primaryKeyName] !== b[i][b[i].constructor.primaryKeyName]) {
        diffs.push([i, null, b[i]]);
        break
      }
    } else if (event_name === "afterDestroy") for (var i = 0; i < a.length; ++i) if (!b[i] || b[i] && b[i][b[i].constructor.primaryKeyName] !== a[i][a[i].constructor.primaryKeyName]) {
      diffs.push([i, 1]);
      break
    }
    return diffs
  };
  ActiveRecord.Synchronization = Synchronization;

  /**
   * Adapter for SQLite
   *
   * Requires lib_sqlite
   *
   */
  Adapters.SQLite = ActiveSupport.extend(ActiveSupport.clone(Adapters.SQL), {
    createTable: function(table_name, columns) {
      var keys = ActiveSupport.keys(columns);
      var fragments = [];
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (columns[key].primaryKey) {
          var type = columns[key].type || "INTEGER";
          fragments.unshift(this.quoteIdentifier(key) + " " + type + " PRIMARY KEY")
        } else fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns))
      }
      return this.executeSQL("CREATE TABLE IF NOT EXISTS " + table_name + " (" + fragments.join(",") + ")")
    },
    dropColumn: function(table_name, column_name) {
      this.transaction(ActiveSupport.bind(function() {
        var description = ActiveRecord.connection.iterableFromResultSet(ActiveRecord.connection.executeSQL('SELECT * FROM sqlite_master WHERE tbl_name = "' + table_name + '"')).iterate(0);
        var temp_table_name = "temp_" + table_name;
        ActiveRecord.execute(description["sql"].replace(new RegExp('^CREATE\\s+TABLE\\s+' + table_name), "CREATE TABLE " + temp_table_name).replace(new RegExp('(,|\\()\\s*' + column_name + '[\\s\\w]+(\\)|,)'), function () {
          return (args[1] == "(" ? "(" : "") + args[2]
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
    ActiveSupport.extend(this, ActiveRecord.Adapters.InstanceMethods);
    ActiveSupport.extend(this, ActiveRecord.Adapters.SQL);
    ActiveSupport.extend(this, {
      quoteIdentifier: function(field) {
        return '[' + field + ']';
      },
      executeSQL: function(sql) {
        var params = ActiveSupport.arrayFrom(arguments).slice(1);
        //var i = 0;
        //sql = sql.replace(/\?/g, function() {
        //  return '$' + (++i);
        //});
        ActiveRecord.connection.log("Adapters.Access.executeSQL: " + sql + " [" + params.join(',') + "]");
        var query = ActiveRecord.Adapters.Access.db.query(sql, params);
        return query.getAll();
      },
      getLastInsertedRowId: function() {
        var rec = ActiveRecord.Adapters.Access.db.query('SELECT @@IDENTITY AS [val]').getOne();
        return rec.val;
      },
      getDefaultColumnDefinitionFragmentFromValue: function(value) {
        if (typeof value === "string") return "TEXT(255)";
        if (typeof value === "number") return "INT";
        if (typeof value == "boolean") return "BIT";
        return "MEMO"
      },
      createTable: function(table_name, columns) {
        var keys = ActiveSupport.keys(columns);
        var fragments = [];
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (columns[key].primaryKey) {
            var type = columns[key].type || "INTEGER IDENTITY(123,1) NOT NULL";
            fragments.unshift("[" + key + "] " + type + " CONSTRAINT [pk_" + key + "] PRIMARY KEY")
          } else {
            fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns))
          }
        }
        try {
          var result = this.executeSQL("CREATE TABLE [" + table_name + "] (" + fragments.join(", ") + ")");
        } catch (e) {
          if (!e.message || !e.message.match(/already exists/)) {
            throw e;
          }
        }
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
    var name = options.database || 'application';
    ActiveRecord.Adapters.Access.db = msa.open(name);
    return new ActiveRecord.Adapters.Access();
  };
  ActiveRecord.Adapters.Access.isDefault = true;

  return ActiveRecord
}
