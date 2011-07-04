/*!
 * Data Modeling
 *
 * Allows creation of data models that may have validation and relationships to other models. Instances
 * of a model represent records that can be read from or saved to a relational data source using an
 * ORM (object relational mapper) such as ActiveRecord.
 *
 */
if (!this.lib_model) this.lib_model = lib_model;
function lib_model() {
  var ActiveRecord = lib('activerecord');
  var Models = app.Models = ActiveRecord.Models;
  var defaultDatabaseName = app.cfg('defaults/model/default_database') || 'appdata';

  setGlobal({Models: Models, ActiveRecord: ActiveRecord});

  var connections = {};
  function connect(database) {
    database = database || defaultDatabaseName;
    if (!connections[database]) {
      connections[database] = ActiveRecord.connect(ActiveRecord.Adapters.Access, {database: database});
    }
    return connections[database];
  }

  function model() {
    if (arguments.length == 1) {
      return model.get.apply(model, arguments);
    }
    if (arguments.length > 2) {
      return model.get.apply(model, arguments);
    }
    return model.create.apply(model, arguments);
  }

  model.get = function(name) {
    return Models[name];
  };

  model.call = function(name, fn) {
    if (Models[name] && Models[name][fn]) {
      Models[name][fn].apply(Models[name], toArray(arguments).slice(2))
    }
  };

  model.create = function(name, def) {
    connect(def.database);
    ActiveRecord.create({tableName: def.table, modelName: name}, def.fields, def.methods, def.callback);
  };

  return model;
}
