if (!this.lib_model) this.lib_model = lib_model;
function lib_model() {
  var ActiveRecord = lib('activerecord');

  var Models = {};
  setGlobal('Models', Models);

  var connected = false;
  function connect() {
    ActiveRecord.connect(ActiveRecord.Adapters.Access, {database: 'appdata'});
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
    if (!connected) connect();
    Models[name] = ActiveRecord.create(def.table, def.properties, def.methods);
  };

  return model;
}