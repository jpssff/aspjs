/*!
 * ActiveEvent
 *
 * After calling ActiveEvent.extend(object), the given object will inherit the methods in this
 * namespace. If the given object has a prototype (is a class constructor),
 * the object's prototype will inherit these methods as well.
 */
if (!this.lib_activeevent) this.lib_activeevent = lib_activeevent;
function lib_activeevent() {
  var ActiveSupport = lib("activesupport"),  ActiveEvent = {};

  ActiveEvent.extend = function(object) {
    object.makeObservable = function(method_name) {
      if (this[method_name]) {
        this._objectEventSetup(method_name);
        this[method_name] = ActiveSupport.wrap(this[method_name], function(proceed) {
          var args = toArray(arguments).slice(1);
          var response = proceed.apply(this, args);
          args.unshift(method_name);
          this.notify.apply(this, args);
          return response
        })
      }
      if (this.prototype) this.prototype.makeObservable(method_name)
    };
    object.observeMethod = function(method_name, observer, scope) {
      return new ActiveEvent.MethodCallObserver([
        [this, method_name]
      ], observer, scope)
    };
    object._objectEventSetup = function(event_name) {
      if (!this._observers) this._observers = {};
      if (!(event_name in this._observers)) this._observers[event_name] = []
    };
    object.observe = function(event_name, observer) {
      if (typeof event_name === "string" && typeof observer !== "undefined") {
        this._objectEventSetup(event_name);
        if (!(this._observers[event_name].indexOf(observer) > -1)) this._observers[event_name].push(observer)
      } else for (var e in event_name) this.observe(e, event_name[e]);
      return observer
    };
    object.stopObserving = function(event_name, observer) {
      this._objectEventSetup(event_name);
      if (event_name && observer) this._observers[event_name] = ActiveSupport.without(this._observers[event_name], observer);
      else if (event_name) this._observers[event_name] = [];
      else this._observers = {}
    };
    object.observeOnce = function(event_name, outer_observer) {
      var inner_observer = ActiveSupport.bind(function() {
        outer_observer.apply(this, arguments);
        this.stopObserving(event_name, inner_observer)
      }, this);
      this._objectEventSetup(event_name);
      this._observers[event_name].push(inner_observer);
      return inner_observer
    };
    object.notify = function(event_name) {
      if (!this._observers || !this._observers[event_name] || this._observers[event_name] && this._observers[event_name].length == 0) return [];
      this._objectEventSetup(event_name);
      var collected_return_values = [];
      var args = toArray(arguments).slice(1);
      for (var i = 0; i < this._observers[event_name].length; ++i) {
        var response = this._observers[event_name][i].apply(this._observers[event_name][i], args);
        if (response === false) return false;
        else collected_return_values.push(response)
      }
      return collected_return_values
    };
    if (object.prototype) {
      object.prototype.makeObservable = object.makeObservable;
      object.prototype.observeMethod = object.observeMethod;
      object.prototype._objectEventSetup = object._objectEventSetup;
      object.prototype.observe = object.observe;
      object.prototype.stopObserving = object.stopObserving;
      object.prototype.observeOnce = object.observeOnce;
      object.prototype.notify = function(event_name) {
        if ((!object._observers || !object._observers[event_name] || object._observers[event_name] && object._observers[event_name].length == 0) && (!this.options || !this.options[event_name]) && (!this._observers || !this._observers[event_name] || this._observers[event_name] && this._observers[event_name].length == 0)) return [];
        var args = toArray(arguments).slice(1);
        var collected_return_values = [];
        if (object.notify) {
          object_args = toArray(arguments).slice(1);
          object_args.unshift(this);
          object_args.unshift(event_name);
          var collected_return_values_from_object = object.notify.apply(object, object_args);
          if (collected_return_values_from_object === false) return false;
          collected_return_values = collected_return_values.concat(collected_return_values_from_object)
        }
        this._objectEventSetup(event_name);
        var response;
        if (this.options && this.options[event_name] && typeof this.options[event_name] === "function") {
          response = this.options[event_name].apply(this, args);
          if (response === false) return false;
          else collected_return_values.push(response)
        }
        for (var i = 0; i < this._observers[event_name].length; ++i) {
          response = this._observers[event_name][i].apply(this._observers[event_name][i], args);
          if (response === false) return false;
          else collected_return_values.push(response)
        }
        return collected_return_values
      }
    }
  };
  ActiveEvent.MethodCallObserver = function(methods, observer, scope) {
    this.stop = function() {
      for (var i = 0; i < this.methods.length; ++i) this.methods[i][0][this.methods[i][1]] = this.originals[i]
    };
    this.methods = methods;
    this.originals = [];
    for (var i = 0; i < this.methods.length; ++i) {
      this.originals.push(this.methods[i][0][this.methods[i][1]]);
      this.methods[i][0][this.methods[i][1]] = ActiveSupport.wrap(this.methods[i][0][this.methods[i][1]], function (proceed) {
        var args = toArray(arguments).slice(1);
        observer.apply(this, args);
        return proceed.apply(this, args)
      })
    }
    if (scope) {
      scope();
      this.stop()
    }
  };
  var ObservableHash = function(object) {
      this._object = object || {}
      };
  ObservableHash.prototype.set = function(key, value) {
    this._object[key] = value;
    this.notify("set", key, value);
    return value
  };
  ObservableHash.prototype.get = function(key) {
    this.notify("get", key);
    return this._object[key]
  };
  ObservableHash.prototype.unset = function(key) {
    this.notify("unset", key);
    var value = this._object[key];
    delete this._object[key];
    return value
  };
  ObservableHash.prototype.toObject = function() {
    return this._object
  };
  ActiveEvent.extend(ObservableHash);
  ActiveEvent.ObservableHash = ObservableHash;

  return ActiveEvent
}
