/*!
 * ActiveSupport
 *
 * Provides a number of methods from the Prototype.js framework, without modifying any built in
 * prototypes to ensure compatibility and portability.
 */
if (!this.lib_activesupport) this.lib_activesupport = lib_activesupport;
function lib_activesupport() {
  var ActiveSupport, global_context = global;
  ActiveSupport = {
    getGlobalContext: function getGlobalContext() {
      return global_context
    },
    getClass: function getClass(class_name, context) {
      context = context || ActiveSupport.getGlobalContext();
      var klass = context[class_name];
      if (!klass) {
        var trigger_no_such_method = typeof context.__noSuchMethod__ !== "undefined";
        if (trigger_no_such_method) try {
          context[class_name]();
          klass = context[class_name]
        } catch (e) {
          return false
        }
      }
      return klass
    },
    log: function log() {
      if (typeof console !== "undefined") console.log.apply(console, arguments || []);
      else {
        if (!ActiveRecord._log) ActiveRecord._log = [];
        ActiveRecord._log.push(arguments || [])
      }
    },
    createError: function createError(message) {
      return new Error(message)
    },
    logErrors: true,
    throwErrors: true,
    throwError: function throwError(error) {
      if (typeof error == "string") error = new Error(error);
      var error_arguments = ActiveSupport.arrayFrom(arguments).slice(1);
      if (ActiveSupport.logErrors) ActiveSupport.log.apply(ActiveSupport, ["Throwing error:", error].concat(error_arguments));
      if (ActiveSupport.throwErrors) {
        var e = ActiveSupport.clone(error);
        e.message = e.message + error_arguments.join(",");
        throw e;
      }
    },
    arrayFrom: function arrayFrom(object) {
      if (!object) return [];
      var length = object.length || 0;
      var results = new Array(length);
      while (length--) results[length] = object[length];
      return results
    },
    isArray: function isArray(object) {
      return object && typeof object == "object" && "length" in object && "splice" in object && "join" in object
    },
    indexOf: function indexOf(array, item, i) {
      i = i || 0;
      var length = array.length;
      if (i < 0) i = length + i;
      for (; i < length; i++) if (array[i] === item) return i;
      return -1
    },
    without: function without(arr) {
      var values = ActiveSupport.arrayFrom(arguments).slice(1);
      var response = [];
      for (var i = 0; i < arr.length; i++) if (!(ActiveSupport.indexOf(values, arr[i]) > -1)) response.push(arr[i]);
      return response
    },
    bind: function bind(func, object) {
      if (typeof object == "undefined") return func;
      return function bound() {
        return func.apply(object, arguments)
      }
    },
    curry: function curry(func) {
      if (arguments.length == 1) return func;
      var args = ActiveSupport.arrayFrom(arguments).slice(1);
      return function curried() {
        return func.apply(this, args.concat(ActiveSupport.arrayFrom(arguments)))
      }
    },
    wrap: function wrap(func, wrapper) {
      return function wrapped() {
        wrapper.apply(this, [ActiveSupport.bind(func, this)].concat(ActiveSupport.arrayFrom(arguments)))
      }
    },
    keys: function keys(object) {
      var keys_array = [];
      for (var property_name in object) keys_array.push(property_name);
      return keys_array
    },
    underscore: function underscore(str) {
      return str.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, function (match) {
        match = match.split("");
        return match[0] + "_" + match[1]
      }).replace(/([a-z\d])([A-Z])/g, function (match) {
        match = match.split("");
        return match[0] + "_" + match[1]
      }).replace(/-/g, "_").toLowerCase()
    },
    camelize: function camelize(str, capitalize) {
      var camelized, parts = str.replace(/\_/g, "-").split("-"),
          len = parts.length;
      if (len === 1) if (capitalize) return parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
      else return parts[0];
      if (str.charAt(0) === "-") camelized = parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
      else camelized = parts[0];
      for (var i = 1; i < len; i++) camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
      if (capitalize) return camelized.charAt(0).toUpperCase() + camelized.substring(1);
      else return camelized
    },
    extend: function extend(destination, source) {
      for (var property in source) destination[property] = source[property];
      return destination
    },
    clone: function clone(object) {
      return ActiveSupport.extend({}, object)
    },
    proc: function proc(proc) {
      return typeof proc === "function" ? proc : function () {
        return proc
      }
    },
    value: function value(value) {
      return typeof value === "function" ? value() : value
    },
    synchronize: function synchronize(execute, finish) {
      var scope = {};
      var stack = [];
      stack.waiting = {};
      stack.add = function add(callback) {
        var wrapped = ActiveSupport.wrap(callback ||
        function () {}, function synchronizationWrapper(proceed) {
          var i = null;
          var index = ActiveSupport.indexOf(stack, wrapped);
          stack.waiting[index] = [proceed, ActiveSupport.arrayFrom(arguments)];
          var all_present = true;
          for (i = 0; i < stack.length; ++i) if (!stack.waiting[i]) all_present = false;
          if (all_present) for (i = 0; i < stack.length; ++i) {
            var item = stack.waiting[i];
            item[0].apply(item[0], item[1]);
            delete stack.waiting[i]
          }
          if (all_present && i === stack.length) if (finish) finish(scope)
        });
        stack.push(wrapped);
        return wrapped
      };
      execute(stack, scope);
      if (stack.length === 0 && finish) finish(scope)
    },
    Inflector: {
      Inflections: {
        plural: [
          [/(quiz)$/i, "$1zes"],
          [/^(ox)$/i, "$1en"],
          [/([m|l])ouse$/i, "$1ice"],
          [/(matr|vert|ind)ix|ex$/i, "$1ices"],
          [/(x|ch|ss|sh)$/i, "$1es"],
          [/([^aeiouy]|qu)y$/i, "$1ies"],
          [/(hive)$/i, "$1s"],
          [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
          [/sis$/i, "ses"],
          [/([ti])um$/i, "$1a"],
          [/(buffal|tomat)o$/i, "$1oes"],
          [/(bu)s$/i, "$1ses"],
          [/(alias|status)$/i, "$1es"],
          [/(octop|vir)us$/i, "$1i"],
          [/(ax|test)is$/i, "$1es"],
          [/s$/i, "s"],
          [/$/, "s"]
        ],
        singular: [
          [/(quiz)zes$/i, "$1"],
          [/(matr)ices$/i, "$1ix"],
          [/(vert|ind)ices$/i, "$1ex"],
          [/^(ox)en/i, "$1"],
          [/(alias|status)es$/i, "$1"],
          [/(octop|vir)i$/i, "$1us"],
          [/(cris|ax|test)es$/i, "$1is"],
          [/(shoe)s$/i, "$1"],
          [/(o)es$/i, "$1"],
          [/(bus)es$/i, "$1"],
          [/([m|l])ice$/i, "$1ouse"],
          [/(x|ch|ss|sh)es$/i, "$1"],
          [/(m)ovies$/i, "$1ovie"],
          [/(s)eries$/i, "$1eries"],
          [/([^aeiouy]|qu)ies$/i, "$1y"],
          [/([lr])ves$/i, "$1f"],
          [/(tive)s$/i, "$1"],
          [/(hive)s$/i, "$1"],
          [/([^f])ves$/i, "$1fe"],
          [/(^analy)ses$/i, "$1sis"],
          [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
          [/([ti])a$/i, "$1um"],
          [/(n)ews$/i, "$1ews"],
          [/s$/i, ""]
        ],
        irregular: [
          ["move", "moves"],
          ["sex", "sexes"],
          ["child", "children"],
          ["man", "men"],
          ["person", "people"]
        ],
        uncountable: ["sheep", "fish", "series", "species", "money", "rice", "information", "equipment"]
      },
      ordinalize: function ordinalize(number) {
        if (11 <= parseInt(number, 10) % 100 && parseInt(number, 10) % 100 <= 13) return number + "th";
        else switch (parseInt(number, 10) % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
        default:
          return number + "th"
        }
      },
      pluralize: function pluralize(word) {
        var i;
        for (i = 0; i < ActiveSupport.Inflector.Inflections.uncountable.length; i++) {
          var uncountable = ActiveSupport.Inflector.Inflections.uncountable[i];
          if (word.toLowerCase === uncountable) return uncountable
        }
        for (i = 0; i < ActiveSupport.Inflector.Inflections.irregular.length; i++) {
          var singular = ActiveSupport.Inflector.Inflections.irregular[i][0];
          var plural = ActiveSupport.Inflector.Inflections.irregular[i][1];
          if (word.toLowerCase === singular || word === plural) return plural
        }
        for (i = 0; i < ActiveSupport.Inflector.Inflections.plural.length; i++) {
          var regex = ActiveSupport.Inflector.Inflections.plural[i][0];
          var replace_string = ActiveSupport.Inflector.Inflections.plural[i][1];
          if (regex.test(word)) return word.replace(regex, replace_string)
        }
      },
      singularize: function singularize(word) {
        var i;
        for (i = 0; i < ActiveSupport.Inflector.Inflections.uncountable.length; i++) {
          var uncountable = ActiveSupport.Inflector.Inflections.uncountable[i];
          if (word.toLowerCase === uncountable) return uncountable
        }
        for (i = 0; i < ActiveSupport.Inflector.Inflections.irregular.length; i++) {
          var singular = ActiveSupport.Inflector.Inflections.irregular[i][0];
          var plural = ActiveSupport.Inflector.Inflections.irregular[i][1];
          if (word.toLowerCase === singular || word === plural) return plural
        }
        for (i = 0; i < ActiveSupport.Inflector.Inflections.singular.length; i++) {
          var regex = ActiveSupport.Inflector.Inflections.singular[i][0];
          var replace_string = ActiveSupport.Inflector.Inflections.singular[i][1];
          if (regex.test(word)) return word.replace(regex, replace_string)
        }
      }
    },
    dateFromDateTime: function dateFromDateTime(date_time) {
      var parts = date_time.replace(/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/, "$1 $2 $3 $4 $5 $6").split(" ");
      return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])
    },
    dateFormat: function date_format_wrapper() {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
          timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[\-\+]\d{4})?)\b/g,
          timezoneClip = /[^\-\+\dA-Z]/g,
          pad = function (val, len) {
          val = String(val);
          len = len || 2;
          while (val.length < len) val = "0" + val;
          return val
          };
      var dateFormat = function dateFormat(date, mask, utc) {
          var dF = dateFormat;
          if (arguments.length === 1 && (typeof date === "string" || date instanceof String) && !/\d/.test(date)) {
            mask = date;
            date = undefined
          }
          date = date ? new Date(date) : new Date;
          if (isNaN(date)) return ActiveSupport.throwError(new SyntaxError("invalid date"));
          mask = String(dF.masks[mask] || mask || dF.masks["default"]);
          if (mask.slice(0, 4) === "UTC:") {
            mask = mask.slice(4);
            utc = true
          }
          var _ = utc ? "getUTC" : "get",
              d = date[_ + "Date"](),
              D = date[_ + "Day"](),
              m = date[_ + "Month"](),
              y = date[_ + "FullYear"](),
              H = date[_ + "Hours"](),
              M = date[_ + "Minutes"](),
              s = date[_ + "Seconds"](),
              L = date[_ + "Milliseconds"](),
              o = utc ? 0 : date.getTimezoneOffset(),
              flags = {
              d: d,
              dd: pad(d),
              ddd: dF.i18n.dayNames[D],
              dddd: dF.i18n.dayNames[D + 7],
              m: m + 1,
              mm: pad(m + 1),
              mmm: dF.i18n.monthNames[m],
              mmmm: dF.i18n.monthNames[m + 12],
              yy: String(y).slice(2),
              yyyy: y,
              h: H % 12 || 12,
              hh: pad(H % 12 || 12),
              H: H,
              HH: pad(H),
              M: M,
              MM: pad(M),
              s: s,
              ss: pad(s),
              l: pad(L, 3),
              L: pad(L > 99 ? Math.round(L / 10) : L),
              t: H < 12 ? "a" : "p",
              tt: H < 12 ? "am" : "pm",
              T: H < 12 ? "A" : "P",
              TT: H < 12 ? "AM" : "PM",
              Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
              o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
              S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
              };
          return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
          })
          };
      dateFormat.masks = {
        "default": "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        MySQL: "yyyy-mm-dd HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
      };
      dateFormat.i18n = {
        dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      };
      return dateFormat
    }(),
    JSONFromObject: function JSONFromObject(object) {
      return ActiveSupport.JSON.stringify(object)
    },
    XMLFromObject: function XMLFromObject(outer_key_name, object) {
      var indent = 0;
      var str_repeat = function str_repeat(string, repeat) {
          var response = "";
          for (var i = 0; i < repeat; ++i) response += string;
          return response
          };
      var serialize_value = function serialize_value(key_name, value, indent) {
          var response = "";
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") response = "<![CDATA[" + (new String(value)).toString() + "]]\>";
          else if (typeof value === "object") {
            response += String.fromCharCode(10);
            if ("length" in value && "splice" in value) for (var i = 0; i < value.length; ++i) response += wrap_value(ActiveSupport.Inflector.singularize(key_name) || key_name, value[i], indent + 1);
            else {
              var object = value.toObject && typeof value.toObject === "function" ? value.toObject() : value;
              for (key_name in object) response += wrap_value(key_name, object[key_name], indent + 1)
            }
            response += str_repeat(" ", 4 * indent)
          }
          return response
          };
      var sanitize_key_name = function sanitize_key_name(key_name) {
          return key_name.replace(/[\s\_]+/g, "-").toLowerCase()
          };
      var wrap_value = function wrap_value(key_name, value, indent) {
          key_name = sanitize_key_name(key_name);
          return str_repeat(" ", 4 * indent) + "<" + key_name + ">" + serialize_value(key_name, value, indent) + "</" + key_name + ">" + String.fromCharCode(10)
          };
      outer_key_name = sanitize_key_name(outer_key_name);
      return "<" + outer_key_name + ">" + serialize_value(outer_key_name, object, 0) + "</" + outer_key_name + ">"
    },
    JSON: lib('json')
  };
  return ActiveSupport
}

/*!
 * ActiveEvent
 *
 * After calling ActiveEvent.extend(object), the given object will inherit the methods in this
 * namespace. If the given object has a prototype (is a class constructor),
 * the object's prototype will inherit these methods as well.
 */
if (!this.lib_activeevent) this.lib_activeevent = lib_activeevent;
function lib_activeevent() {
  var ActiveSupport = lib("activesupport"),
      ActiveEvent = {};
  ActiveEvent.extend = function extend(object) {
    object.makeObservable = function makeObservable(method_name) {
      if (this[method_name]) {
        this._objectEventSetup(method_name);
        this[method_name] = ActiveSupport.wrap(this[method_name], function wrapped_observer(proceed) {
          var args = ActiveSupport.arrayFrom(arguments).slice(1);
          var response = proceed.apply(this, args);
          args.unshift(method_name);
          this.notify.apply(this, args);
          return response
        })
      }
      if (this.prototype) this.prototype.makeObservable(method_name)
    };
    object.observeMethod = function observeMethod(method_name, observer, scope) {
      return new ActiveEvent.MethodCallObserver([
        [this, method_name]
      ], observer, scope)
    };
    object._objectEventSetup = function _objectEventSetup(event_name) {
      this._observers = this._observers || {};
      this._observers[event_name] = this._observers[event_name] || []
    };
    object.observe = function observe(event_name, observer) {
      if (typeof event_name === "string" && typeof observer !== "undefined") {
        this._objectEventSetup(event_name);
        if (!(ActiveSupport.indexOf(this._observers[event_name], observer) > -1)) this._observers[event_name].push(observer)
      } else for (var e in event_name) this.observe(e, event_name[e]);
      return observer
    };
    object.stopObserving = function stopObserving(event_name, observer) {
      this._objectEventSetup(event_name);
      if (event_name && observer) this._observers[event_name] = ActiveSupport.without(this._observers[event_name], observer);
      else if (event_name) this._observers[event_name] = [];
      else this._observers = {}
    };
    object.observeOnce = function observeOnce(event_name, outer_observer) {
      var inner_observer = ActiveSupport.bind(function bound_inner_observer() {
        outer_observer.apply(this, arguments);
        this.stopObserving(event_name, inner_observer)
      }, this);
      this._objectEventSetup(event_name);
      this._observers[event_name].push(inner_observer);
      return inner_observer
    };
    object.notify = function notify(event_name) {
      if (!this._observers || !this._observers[event_name] || this._observers[event_name] && this._observers[event_name].length == 0) return [];
      this._objectEventSetup(event_name);
      var collected_return_values = [];
      var args = ActiveSupport.arrayFrom(arguments).slice(1);
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
      object.prototype.notify = function notify(event_name) {
        if ((!object._observers || !object._observers[event_name] || object._observers[event_name] && object._observers[event_name].length == 0) && (!this.options || !this.options[event_name]) && (!this._observers || !this._observers[event_name] || this._observers[event_name] && this._observers[event_name].length == 0)) return [];
        var args = ActiveSupport.arrayFrom(arguments).slice(1);
        var collected_return_values = [];
        if (object.notify) {
          object_args = ActiveSupport.arrayFrom(arguments).slice(1);
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
  ActiveEvent.MethodCallObserver = function MethodCallObserver(methods, observer, scope) {
    this.stop = function stop() {
      for (var i = 0; i < this.methods.length; ++i) this.methods[i][0][this.methods[i][1]] = this.originals[i]
    };
    this.methods = methods;
    this.originals = [];
    for (var i = 0; i < this.methods.length; ++i) {
      this.originals.push(this.methods[i][0][this.methods[i][1]]);
      this.methods[i][0][this.methods[i][1]] = ActiveSupport.wrap(this.methods[i][0][this.methods[i][1]], function (proceed) {
        var args = ActiveSupport.arrayFrom(arguments).slice(1);
        observer.apply(this, args);
        return proceed.apply(this, args)
      })
    }
    if (scope) {
      scope();
      this.stop()
    }
  };
  var ObservableHash = function ObservableHash(object) {
      this._object = object || {}
      };
  ObservableHash.prototype.set = function set(key, value) {
    this._object[key] = value;
    this.notify("set", key, value);
    return value
  };
  ObservableHash.prototype.get = function get(key) {
    this.notify("get", key);
    return this._object[key]
  };
  ObservableHash.prototype.unset = function unset(key) {
    this.notify("unset", key);
    var value = this._object[key];
    delete this._object[key];
    return value
  };
  ObservableHash.prototype.toObject = function toObject() {
    return this._object
  };
  ActiveEvent.extend(ObservableHash);
  ActiveEvent.ObservableHash = ObservableHash;
  return ActiveEvent
}

/*!
 * ActiveRecord
 *
 * ActiveRecord is an object relational mapper that shares a similar vocabulary to the Ruby
 * ActiveRecord implementation, but uses JavaScript.
 */
if (!this.lib_activerecord) this.lib_activerecord = lib_activerecord;
function lib_activerecord() {
  var ActiveSupport = lib("activesupport"),
      ActiveEvent = lib("activeevent"),
      ActiveRecord;
  ActiveRecord = {
    logging: false,
    autoMigrate: true,
    internalCounter: 0,
    Models: {},
    ClassMethods: {},
    InstanceMethods: {},
    create: function create(options, fields, methods) {
      if (!ActiveRecord.connection) {
        return ActiveSupport.throwError(ActiveRecord.Errors.ConnectionNotEstablished)
      }
      if (typeof options === "string") {
        options = {
          tableName: options
        }
      }
      var model = null;
      if (!options.modelName) {
        var model_name = ActiveSupport.camelize(ActiveSupport.Inflector.singularize(options.tableName) || options.tableName);
        options.modelName = model_name.charAt(0).toUpperCase() + model_name.substring(1)
      }
      model = ActiveRecord.Models[options.modelName] = function initialize(data) {
        this.modelName = this.constructor.modelName;
        this.tableName = this.constructor.tableName;
        this.primaryKeyName = this.constructor.primaryKeyName;
        this._object = {};
        for (var key in data) {
          this.set(key, data[key], true)
        }
        this._errors = [];
        for (var key in this.constructor.fields) {
          if (!this.constructor.fields[key].primaryKey) {
            var value = ActiveRecord.connection.fieldOut(this.constructor.fields[key], this.get(key));
            if (Migrations.objectIsFieldDefinition(value)) {
              value = value.value
            }
            this.set(key, value)
          }
        }
        this.notify("afterInitialize", data)
      };
      model.modelName = options.modelName;
      model.tableName = options.tableName;
      model.primaryKeyName = "id";
      ActiveSupport.extend(model.prototype, ActiveRecord.InstanceMethods);
      if (methods && typeof methods !== "function") {
        ActiveSupport.extend(model.prototype, methods || {})
      }
      ActiveSupport.extend(model, ActiveRecord.ClassMethods);
      ActiveEvent.extend(model);
      if (!fields) {
        fields = {}
      }
      var custom_primary_key = false;
      for (var field_name in fields) {
        if (typeof fields[field_name] === "object" && fields[field_name].type && !("value" in fields[field_name])) {
          fields[field_name].value = null
        }
        if (typeof fields[field_name] === "object" && fields[field_name].primaryKey) {
          custom_primary_key = field_name
        }
      }
      if (!custom_primary_key) {
        fields["id"] = {
          primaryKey: true
        }
      }
      model.fields = fields;
      if (custom_primary_key) {
        model.primaryKeyName = custom_primary_key
      }
      for (var key in model.fields) {
        Finders.generateFindByField(model, key);
        Finders.generateFindAllByField(model, key)
      }
      if (ActiveRecord.autoMigrate) {
        Migrations.Schema.createTable(options.tableName, ActiveSupport.clone(model.fields))
      }
      return model
    }
  };
  ActiveRecord.define = ActiveRecord.create;
  ActiveEvent.extend(ActiveRecord);
  ActiveRecord.eventNames = ["afterInitialize", "afterFind", "beforeSave", "afterSave", "beforeCreate", "afterCreate", "beforeDestroy", "afterDestroy"];
  (function () {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) {
      ActiveRecord.ClassMethods[ActiveRecord.eventNames[i]] = ActiveRecord.InstanceMethods[ActiveRecord.eventNames[i]] = ActiveSupport.curry(function event_name_delegator(event_name, observer) {
        return this.observe(event_name, observer)
      }, ActiveRecord.eventNames[i])
    }
  })();
  ActiveRecord.old_observe = ActiveRecord.observe;
  ActiveRecord.observe = function observe(event_name, observer) {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) {
      if (ActiveRecord.eventNames[i] === event_name) {
        var observers = [];
        var model_observer;
        for (var model_name in ActiveRecord.Models) {
          model_observer = ActiveSupport.curry(observer, ActiveRecord.Models[model_name]);
          observers.push(model_observer);
          ActiveRecord.Models[model_name].observe(event_name, model_observer)
        }
        return observers
      }
    }
    return ActiveRecord.old_observe(event_name, observer)
  };
  (function () {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) {
      ActiveRecord[ActiveRecord.eventNames[i]] = ActiveSupport.curry(function event_name_delegator(event_name, observer) {
        ActiveRecord.observe(event_name, observer)
      }, ActiveRecord.eventNames[i])
    }
  })();
  var Errors = {
    ConnectionNotEstablished: ActiveSupport.createError("No ActiveRecord connection is active."),
    MethodDoesNotExist: ActiveSupport.createError("The requested method does not exist."),
    InvalidFieldType: ActiveSupport.createError("The field type does not exist:")
  };
  ActiveRecord.Errors = Errors;
  ActiveSupport.extend(ActiveRecord.InstanceMethods, {
    set: function set(key, value, surpress_notifications) {
      if (typeof this[key] !== "function") {
        this[key] = value
      }
      this._object[key] = value;
      if (!surpress_notifications) {
        this.notify("set", key, value)
      }
    },
    get: function get(key) {
      return this._object[key]
    },
    toObject: function toObject() {
      return ActiveSupport.clone(this._object)
    },
    keys: function keys() {
      var keys_array = [];
      for (var key_name in this._object) {
        keys_array.push(key_name)
      }
      return keys_array
    },
    values: function values() {
      var values_array = [];
      for (var key_name in this._object) {
        values_array.push(this._object[key_name])
      }
      return values_array
    },
    updateAttribute: function updateAttribute(key, value) {
      this.set(key, value);
      return this.save()
    },
    updateAttributes: function updateAttributes(attributes) {
      for (var key in attributes) {
        this.set(key, attributes[key])
      }
      return this.save()
    },
    reload: function reload() {
      if (!this.get(this.constructor.primaryKeyName)) {
        return false
      }
      var record = this.constructor.find(this.get(this.constructor.primaryKeyName));
      if (!record) {
        return false
      }
      this._object = {};
      var raw = record.toObject();
      for (var key in raw) {
        this.set(key, raw[key])
      }
      return true
    },
    save: function save(force_created_mode) {
      if (!this._valid()) {
        return false
      }
      for (var key in this.constructor.fields) {
        if (!this.constructor.fields[key].primaryKey) {
          this.set(key, ActiveRecord.connection.fieldIn(this.constructor.fields[key], this.get(key)), true)
        }
      }
      if (this.notify("beforeSave") === false) {
        return false
      }
      if ("updated" in this._object) {
        this.set("updated", ActiveSupport.dateFormat("yyyy-mm-dd HH:MM:ss"))
      }
      if (force_created_mode || !this.get(this.constructor.primaryKeyName)) {
        if (this.notify("beforeCreate") === false) {
          return false
        }
        if ("created" in this._object) {
          this.set("created", ActiveSupport.dateFormat("yyyy-mm-dd HH:MM:ss"))
        }
        var id = this.get(this.constructor.primaryKeyName);
        ActiveRecord.connection.insertEntity(this.tableName, this.constructor.primaryKeyName, this.toObject());
        if (!id) {
          this.set(this.constructor.primaryKeyName, ActiveRecord.connection.getLastInsertedRowId())
        }
        Synchronization.triggerSynchronizationNotifications(this, "afterCreate");
        this.notify("afterCreate")
      } else {
        ActiveRecord.connection.updateEntity(this.tableName, this.constructor.primaryKeyName, this.get(this.constructor.primaryKeyName), this.toObject())
      }
      for (var key in this.constructor.fields) {
        if (!this.constructor.fields[key].primaryKey) {
          this.set(key, ActiveRecord.connection.fieldOut(this.constructor.fields[key], this.get(key)), true)
        }
      }
      Synchronization.triggerSynchronizationNotifications(this, "afterSave");
      this.notify("afterSave");
      return this
    },
    destroy: function destroy() {
      if (!this.get(this.constructor.primaryKeyName)) {
        return false
      }
      if (this.notify("beforeDestroy") === false) {
        return false
      }
      ActiveRecord.connection.deleteEntity(this.tableName, this.constructor.primaryKeyName, this.get(this.constructor.primaryKeyName));
      Synchronization.triggerSynchronizationNotifications(this, "afterDestroy");
      if (this.notify("afterDestroy") === false) {
        return false
      }
      return true
    },
    toSerializableObject: function toSerializableObject() {
      return this.toObject()
    },
    toJSON: function toJSON(object_to_inject) {
      return ActiveSupport.extend(this.toSerializableObject(), object_to_inject || {})
    },
    toXML: function toXML(object_to_inject) {
      return ActiveSupport.XMLFromObject(this.modelName, ActiveSupport.extend(this.toSerializableObject(), object_to_inject || {}))
    }
  });
  ActiveSupport.extend(ActiveRecord.ClassMethods, {
    find: function find(params) {
      var result;
      if (!params) {
        params = {}
      }
      if (params.first || (typeof params === "number" || typeof params === "string" && params.match(/^\d+$/)) && arguments.length == 1) {
        if (params.first) {
          params.limit = 1;
          result = ActiveRecord.connection.findEntities(this.tableName, params)
        } else {
          result = ActiveRecord.connection.findEntitiesById(this.tableName, this.primaryKeyName, [params])
        }
        if (result && result.iterate && result.iterate(0)) {
          return this.build(result.iterate(0))
        } else {
          return false
        }
      } else {
        result = null;
        if (typeof params === "string" && !params.match(/^\d+$/)) {
          result = ActiveRecord.connection.findEntities.apply(ActiveRecord.connection, arguments)
        } else {
          if (params && (typeof params == "object" && "length" in params && "slice" in params || (typeof params == "number" || typeof params == "string") && arguments.length > 1)) {
            var ids = (typeof params == "number" || typeof params == "string") && arguments.length > 1 ? ActiveSupport.arrayFrom(arguments) : params;
            result = ActiveRecord.connection.findEntitiesById(this.tableName, this.primaryKeyName, ids)
          } else {
            result = ActiveRecord.connection.findEntities(this.tableName, params)
          }
        }
        var response = [];
        if (result) {
          result.iterate(ActiveSupport.bind(function result_iterator(row) {
            response.push(this.build(row))
          }, this))
        }
        this.resultSetFromArray(response, params);
        this.notify("afterFind", response, params);
        return response
      }
    },
    destroy: function destroy(id) {
      if (id == "all") {
        var instances = this.find({
          all: true
        });
        var responses = [];
        for (var i = 0; i < instances.length; ++i) {
          responses.push(instances[i].destroy())
        }
        return responses
      } else {
        var instance = this.find(id);
        if (!instance) {
          return false
        }
        return instance.destroy()
      }
    },
    build: function build(data) {
      ++ActiveRecord.internalCounter;
      var record = new this(ActiveSupport.clone(data));
      record.internalCount = parseInt(new Number(ActiveRecord.internalCounter), 10);
      return record
    },
    create: function create(data) {
      var record = this.build(data);
      record.save(true);
      return record
    },
    update: function update(id, attributes) {
      if (typeof id.length !== "undefined") {
        var results = [];
        for (var i = 0; i < id.length; ++i) {
          results.push(this.update(id[i], attributes[i]))
        }
        return results
      } else {
        var record = this.find(id);
        if (!record) {
          return false
        }
        record.updateAttributes(attributes);
        return record
      }
    },
    updateAll: function updateAll(updates, conditions) {
      ActiveRecord.connection.updateMultitpleEntities(this.tableName, updates, conditions)
    },
    transaction: function transaction(proceed, error) {
      try {
        ActiveRecord.connection.transaction(proceed)
      } catch (e) {
        if (error) {
          error(e)
        } else {
          return ActiveSupport.throwError(e)
        }
      }
    },
    resultSetFromArray: function resultSetFromArray(result_set, params) {
      if (!params) {
        params = {}
      }
      for (var method_name in ResultSet.InstanceMethods) {
        result_set[method_name] = ActiveSupport.curry(ResultSet.InstanceMethods[method_name], result_set, params, this)
      }
      if (params.synchronize) {
        Synchronization.synchronizeResultSet(this, params, result_set)
      }
      return result_set
    }
  });
  ActiveSupport.extend(ActiveRecord.ClassMethods, {
    processCalculationParams: function processCalculationParams(operation, params) {
      if (!params) {
        params = {}
      }
      if (typeof params === "string") {
        params = {
          where: params
        }
      }
      return params
    },
    performCalculation: function performCalculation(operation, params, sql_fragment) {
      if (params && params.synchronize) {
        return Synchronization.synchronizeCalculation(this, operation, params)
      } else {
        return ActiveRecord.connection.calculateEntities(this.tableName, this.processCalculationParams(operation, params), sql_fragment)
      }
    },
    count: function count(params) {
      return this.performCalculation("count", params, "COUNT(*)")
    },
    average: function average(column_name, params) {
      return this.performCalculation("average", params, "AVG(" + column_name + ")")
    },
    max: function max(column_name, params) {
      return this.performCalculation("max", params, "MAX(" + column_name + ")")
    },
    min: function min(column_name, params) {
      return this.performCalculation("min", params, "MIN(" + column_name + ")")
    },
    sum: function sum(column_name, params) {
      return this.performCalculation("sum", params, "SUM(" + column_name + ")")
    },
    first: function first() {
      return this.find({
        first: true
      })
    },
    last: function last() {
      return this.find({
        first: true,
        order: this.primaryKeyName + " DESC"
      })
    }
  });
  var Adapters = {};
  ActiveRecord.adapter = null;
  ActiveRecord.connection = null;
  ActiveRecord.connect = function connect(adapter) {
    if (!adapter) {
      ActiveRecord.connection = Adapters.Auto.connect.apply(Adapters.Auto, ActiveSupport.arrayFrom(arguments).slice(1));
      ActiveRecord.adapter = ActiveRecord.connection.constructor
    } else {
      ActiveRecord.adapter = adapter;
      ActiveRecord.connection = adapter.connect.apply(adapter, ActiveSupport.arrayFrom(arguments).slice(1))
    }
    ActiveEvent.extend(ActiveRecord.connection);
    if (!ActiveRecord.connection.preventConnectedNotification) {
      ActiveRecord.notify("connected")
    }
  };
  ActiveRecord.execute = function execute() {
    if (!ActiveRecord.connection) {
      return ActiveSupport.throwError(ActiveRecord.Errors.ConnectionNotEstablished)
    }
    return ActiveRecord.connection.executeSQL.apply(ActiveRecord.connection, arguments)
  };
  ActiveRecord.escape = function escape(argument, supress_quotes) {
    var quote = supress_quotes ? "" : '"';
    return typeof argument == "number" ? argument : quote + (new String(argument)).toString().replace(/\"/g, '\\"').replace(/\\/g, "\\\\").replace(/\0/g, "\\0") + quote
  };
  Adapters.defaultResultSetIterator = function defaultResultSetIterator(iterator) {
    if (typeof iterator === "number") {
      if (this.rows[iterator]) {
        return ActiveSupport.clone(this.rows[iterator])
      } else {
        return false
      }
    } else {
      for (var i = 0; i < this.rows.length; ++i) {
        var row = ActiveSupport.clone(this.rows[i]);
        iterator(row)
      }
    }
  };
  Adapters.InstanceMethods = {
    setValueFromFieldIfValueIsNull: function setValueFromFieldIfValueIsNull(field, value) {
      if (value === null || typeof value === "undefined") {
        if (Migrations.objectIsFieldDefinition(field)) {
          var default_value = this.getDefaultValueFromFieldDefinition(field);
          if (typeof default_value === "undefined") {
            return ActiveSupport.throwError(Errors.InvalidFieldType, field ? field.type || "[object]" : "false")
          }
          return field.value || default_value
        } else {
          return field
        }
      }
      return value
    },
    getColumnDefinitionFragmentFromKeyAndColumns: function getColumnDefinitionFragmentFromKeyAndColumns(key, columns) {
      var field_name = this.wrap ? this.wrap(key) : key;
      return field_name + " " + (typeof columns[key] === "object" && typeof columns[key].type !== "undefined" ? columns[key].type : this.getDefaultColumnDefinitionFragmentFromValue(columns[key]))
    },
    getDefaultColumnDefinitionFragmentFromValue: function getDefaultColumnDefinitionFragmentFromValue(value) {
      if (typeof value === "string") {
        return "VARCHAR(255)"
      }
      if (typeof value === "number") {
        return "INT"
      }
      if (typeof value == "boolean") {
        return "TINYINT(1)"
      }
      return "TEXT"
    },
    getDefaultValueFromFieldDefinition: function getDefaultValueFromFieldDefinition(field) {
      return field.value ? field.value : Migrations.fieldTypesWithDefaultValues[field.type ? field.type.replace(/\(.*/g, "").toLowerCase() : ""]
    },
    log: function log() {
      if (!ActiveRecord.logging) {
        return
      }
      if (arguments[0]) {
        arguments[0] = "ActiveRecord: " + arguments[0]
      }
      return ActiveSupport.log.apply(ActiveSupport, arguments || {})
    }
  };
  ActiveRecord.Adapters = Adapters;
  Adapters.SQL = {
    schemaLess: false,
    wrap: function(field) {
      return field;
    },
    insertEntity: function insertEntity(table, primary_key_name, data) {
      var keys = ActiveSupport.keys(data).sort();
      var values = [];
      var args = [];
      for (var i = 0; i < keys.length; ++i) {
        args.push(data[keys[i]]);
        keys[i] = this.wrap(keys[i]);
        values.push("?")
      }
      args.unshift("INSERT INTO " + this.wrap(table) + " (" + keys.join(",") + ") VALUES (" + values.join(",") + ")");
      var response = this.executeSQL.apply(this, args);
      var id = data[primary_key_name] || this.getLastInsertedRowId();
      var data_with_id = ActiveSupport.clone(data);
      data_with_id[primary_key_name] = id;
      this.notify("created", table, id, data_with_id);
      return response
    },
    updateMultitpleEntities: function updateMultitpleEntities(table, updates, conditions) {
      var args = [];
      if (typeof updates !== "string") {
        var values = [];
        var keys = ActiveSupport.keys(updates).sort();
        for (var i = 0; i < keys.length; ++i) {
          args.push(updates[keys[i]]);
          values.push(this.wrap(updates[i]) + " = ?")
        }
        updates = values.join(",")
      }
      args.unshift("UPDATE " + this.wrap(table) + " SET " + updates + this.buildWhereSQLFragment(conditions, args));
      return this.executeSQL.apply(this, args)
    },
    updateEntity: function updateEntity(table, primary_key_name, id, data) {
      var keys = ActiveSupport.keys(data).sort();
      var args = [];
      var values = [];
      for (var i = 0; i < keys.length; ++i) {
        if (primary_key_name == keys[i]) continue;
        args.push(data[keys[i]]);
        values.push(this.wrap(keys[i]) + " = ?")
      }
      args.push(id);
      args.unshift("UPDATE " + this.wrap(table) + " SET " + values.join(",") + " WHERE " + this.wrap(primary_key_name) + " = ?");
      var response = this.executeSQL.apply(this, args);
      this.notify("updated", table, id, data);
      return response
    },
    calculateEntities: function calculateEntities(table, params, operation) {
      var process_count_query_result = function process_count_query_result(response) {
        if (!response) {
          return 0
        }
        return parseInt(ActiveRecord.connection.iterableFromResultSet(response).iterate(0)["calculation"], 10)
      };
      var args = this.buildSQLArguments(table, params, operation);
      return process_count_query_result(this.executeSQL.apply(this, args))
    },
    deleteEntity: function deleteEntity(table, primary_key_name, id) {
      var args, response;
      if (id === "all") {
        args = ["DELETE FROM " + this.wrap(table)];
        var ids = [];
        var ids_result_set = this.executeSQL("SELECT " + this.wrap(primary_key_name) + " FROM " + this.wrap(table));
        if (!ids_result_set) {
          return null
        }
        this.iterableFromResultSet(ids_result_set).iterate(function id_collector_iterator(row) {
          ids.push(row[primary_key_name])
        });
        response = this.executeSQL.apply(this, args);
        for (var i = 0; i < ids.length; ++i) {
          this.notify("destroyed", table, ids[i])
        }
        return response
      } else {
        args = ["DELETE FROM " + this.wrap(table) + " WHERE " + this.wrap(primary_key_name) + " = ?", id];
        response = this.executeSQL.apply(this, args);
        this.notify("destroyed", table, id);
        return response
      }
    },
    findEntitiesById: function findEntityById(table, primary_key_name, ids) {
      var response = this.executeSQL.apply(this, ["SELECT * FROM " + this.wrap(table) + " WHERE " + this.wrap(primary_key_name) + " IN (" + ids.join(",") + ")"]);
      if (!response) {
        return false
      } else {
        return ActiveRecord.connection.iterableFromResultSet(response)
      }
    },
    findEntities: function findEntities(table, params) {
      var args;
      if (typeof table === "string" && !table.match(/^\d+$/) && typeof params != "object") {
        args = arguments
      } else {
        args = this.buildSQLArguments(table, params, false)
      }
      var response = this.executeSQL.apply(this, args);
      if (!response) {
        return false
      } else {
        return ActiveRecord.connection.iterableFromResultSet(response)
      }
    },
    buildSQLArguments: function buildSQLArguments(table, params, calculation) {
      var args = [];
      var sql = "SELECT " + (calculation ? calculation + " AS calculation" : params.select ? params.select.join(",") : "*") + " FROM " + this.wrap(table) + this.buildWhereSQLFragment(params.where, args) + (params.joins ? " " + params.joins : "") + (params.group ? " GROUP BY " + params.group : "") + (params.order ? " ORDER BY " + params.order : "") + (params.offset && params.limit ? " LIMIT " + params.offset + "," + params.limit : "") + (!params.offset && params.limit ? " LIMIT " + params.limit : "");
      args.unshift(sql);
      return args
    },
    buildWhereSQLFragment: function buildWhereSQLFragment(fragment, args) {
      var where, keys, i;
      if (fragment && ActiveSupport.isArray(fragment)) {
        for (i = 1; i < fragment.length; ++i) {
          args.push(fragment[i])
        }
        return " WHERE " + fragment[0]
      } else {
        if (fragment && typeof fragment !== "string") {
          where = "";
          keys = ActiveSupport.keys(fragment);
          for (i = 0; i < keys.length; ++i) {
            where += this.wrap(keys[i]) + " = ? AND ";
            var value;
            if (typeof fragment[keys[i]] === "number") {
              value = fragment[keys[i]]
            } else {
              if (typeof fragment[keys[i]] == "boolean") {
                value = parseInt(new Number(fragment[keys[i]]))
              } else {
                value = (new String(fragment[keys[i]])).toString()
              }
            }
            args.push(value)
          }
          where = " WHERE " + where.substring(0, where.length - 4)
        } else {
          if (fragment) {
            where = " WHERE " + fragment
          } else {
            where = ""
          }
        }
      }
      return where
    },
    dropTable: function dropTable(table_name) {
      return this.executeSQL("DROP TABLE IF EXISTS " + this.wrap(table_name))
    },
    addIndex: function addIndex(table_name, column_names, options) {},
    renameTable: function renameTable(old_table_name, new_table_name) {
      this.executeSQL("ALTER TABLE " + this.wrap(old_table_name) + " RENAME TO " + this.wrap(new_table_name))
    },
    removeIndex: function removeIndex(table_name, index_name) {},
    addColumn: function addColumn(table_name, column_name, data_type) {
      return this.executeSQL("ALTER TABLE " + this.wrap(table_name) + " ADD COLUMN " + this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns))
    },
    fieldIn: function fieldIn(field, value) {
      if (value && value instanceof Date) {
        return ActiveSupport.dateFormat(value, "yyyy-mm-dd HH:MM:ss")
      }
      if (Migrations.objectIsFieldDefinition(field)) {
        field = this.getDefaultValueFromFieldDefinition(field)
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      if (typeof field === "string") {
        return (new String(value)).toString()
      }
      if (typeof field === "number") {
        return (new String(value)).toString()
      }
      if (typeof field === "boolean") {
        return (new String(parseInt(new Number(value), 10))).toString()
      }
      if (typeof value === "object" && !Migrations.objectIsFieldDefinition(field)) {
        return ActiveSupport.JSON.stringify(value)
      }
    },
    fieldOut: function fieldOut(field, value) {
      if (Migrations.objectIsFieldDefinition(field)) {
        if (field.type.toLowerCase().match(/date/) && typeof value == "string") {
          return ActiveSupport.dateFromDateTime(value)
        }
        field = this.getDefaultValueFromFieldDefinition(field)
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      if (typeof field === "string") {
        return value
      }
      if (typeof field === "boolean") {
        if (value === "0" || value === 0 || value === "false") {
          value = false
        }
        return !!value
      }
      if (typeof field === "number") {
        var trim = function (str) {
            return (new String(str)).toString().replace(/^\s+|\s+$/g, "")
            };
        return trim(value).length > 0 && !/[^0-9.]/.test(trim(value)) && /\.\d/.test(trim(value)) ? parseFloat(new Number(value)) : parseInt(new Number(value), 10)
      }
      if ((typeof value === "string" || typeof value === "object") && typeof field === "object" && (typeof field.length !== "undefined" || typeof field.type === "undefined")) {
        if (typeof value === "string") {
          return ActiveSupport.JSON.parse(value)
        } else {
          return value
        }
      }
    },
    transaction: function transaction(proceed) {
      try {
        ActiveRecord.connection.executeSQL("BEGIN");
        proceed();
        ActiveRecord.connection.executeSQL("COMMIT")
      } catch (e) {
        ActiveRecord.connection.executeSQL("ROLLBACK");
        return ActiveSupport.throwError(e)
      }
    }
  };
  Adapters.SQLite = ActiveSupport.extend(ActiveSupport.clone(Adapters.SQL), {
    createTable: function createTable(table_name, columns) {
      var keys = ActiveSupport.keys(columns);
      var fragments = [];
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (columns[key].primaryKey) {
          var type = columns[key].type || "INTEGER";
          fragments.unshift(key + " " + type + " PRIMARY KEY")
        } else {
          fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns))
        }
      }
      return this.executeSQL("CREATE TABLE IF NOT EXISTS " + table_name + " (" + fragments.join(",") + ")")
    },
    dropColumn: function dropColumn(table_name, column_name) {
      this.transaction(ActiveSupport.bind(function drop_column_transaction() {
        var description = ActiveRecord.connection.iterableFromResultSet(ActiveRecord.connection.executeSQL('SELECT * FROM sqlite_master WHERE tbl_name = "' + table_name + '"')).iterate(0);
        var temp_table_name = "temp_" + table_name;
        ActiveRecord.execute(description["sql"].replace(new RegExp("^CREATEs+TABLEs+" + table_name), "CREATE TABLE " + temp_table_name).replace(new RegExp("(,|()s*" + column_name + "[sw]+()|,)"), function () {
          return (args[1] == "(" ? "(" : "") + args[2]
        }));
        ActiveRecord.execute("INSERT INTO " + temp_table_name + " SELECT * FROM " + table_name);
        this.dropTable(table_name);
        this.renameTable(temp_table_name, table_name)
      }, this))
    }
  });
  Adapters.InMemory = function InMemory(storage) {
    this.storage = typeof storage === "string" ? ActiveSupport.JSON.parse(storage) : storage || {};
    this.lastInsertId = null
  };
  ActiveSupport.extend(Adapters.InMemory.prototype, Adapters.InstanceMethods);
  ActiveSupport.extend(Adapters.InMemory.prototype, {
    schemaLess: true,
    entityMissing: function entityMissing(id) {
      return {}
    },
    serialize: function serialize() {
      return ActiveSupport.JSON.stringify(this.storage)
    },
    executeSQL: function executeSQL(sql) {
      ActiveRecord.connection.log("Adapters.InMemory could not execute SQL:" + sql)
    },
    insertEntity: function insertEntity(table, primary_key_name, data) {
      this.setupTable(table);
      var max = 1;
      var table_data = this.storage[table];
      if (!data.id) {
        for (var id in table_data) {
          if (parseInt(id, 10) >= max) {
            max = parseInt(id, 10) + 1
          }
        }
        data.id = max
      }
      this.lastInsertId = data.id;
      this.storage[table][data.id] = data;
      this.notify("created", table, data.id, data);
      return true
    },
    getLastInsertedRowId: function getLastInsertedRowId() {
      return this.lastInsertId
    },
    updateMultitpleEntities: function updateMultitpleEntities(table, updates, conditions) {},
    updateEntity: function updateEntity(table, primary_key_name, id, data) {
      this.setupTable(table);
      this.storage[table][id] = data;
      this.notify("updated", table, id, data);
      return true
    },
    calculateEntities: function calculateEntities(table, params, operation) {
      this.setupTable(table);
      var entities = this.findEntities(table, params);
      var parsed_operation = operation.match(/([A-Za-z]+)\(([^\)]+)\)/);
      var operation_type = parsed_operation[1].toLowerCase();
      var column_name = parsed_operation[2];
      switch (operation_type) {
      case "count":
        return entities.length;
      case "max":
        var max = 0;
        for (var i = 0; i < entities.length; ++i) {
          if (parseInt(entities[i][column_name], 10) > max) {
            max = parseInt(entities[i][column_name], 10)
          }
        }
        return max;
      case "min":
        var min = 0;
        if (entities[0]) {
          min = entities[0][column_name]
        }
        for (var i = 0; i < entities.length; ++i) {
          if (entities[i][column_name] < min) {
            min = entities[i][column_name]
          }
        }
        return min;
      case "avg":
        ;
      case "sum":
        var sum = 0;
        for (var i = 0; i < entities.length; ++i) {
          sum += entities[i][column_name]
        }
        return operation_type === "avg" ? sum / entities.length : sum
      }
    },
    deleteEntity: function deleteEntity(table, primary_key_name, id) {
      this.setupTable(table);
      if (!id || id === "all") {
        for (var id_to_be_deleted in this.storage[table]) {
          this.notify("destroyed", table, id_to_be_deleted)
        }
        this.storage[table] = {};
        return true
      } else {
        if (this.storage[table][id]) {
          delete this.storage[table][id];
          this.notify("destroyed", table, id);
          return true
        }
      }
      return false
    },
    findEntitiesById: function findEntitiesById(table, primary_key_name, ids) {
      var table_data = this.storage[table];
      var response = [];
      for (var i = 0; i < ids.length; ++i) {
        var id = parseInt(ids[i], 10);
        if (table_data[id]) {
          response.push(table_data[id])
        }
      }
      return this.iterableFromResultSet(response)
    },
    findEntities: function findEntities(table, params) {
      if (typeof table === "string" && !table.match(/^\d+$/) && typeof params != "object") {
        var sql = table;
        var sql_args = ActiveSupport.arrayFrom(arguments).slice(1);
        for (var i = 0; i < sql_args.length; ++i) {
          sql = sql.replace(/\?/, ActiveRecord.escape(sql_args[i]))
        }
        var response = this.paramsFromSQLString(sql);
        table = response[0];
        params = response[1]
      } else {
        if (typeof params === "undefined") {
          params = {}
        }
      }
      this.setupTable(table);
      var entity_array = [];
      var table_data = this.storage[table];
      if (params && params.where && params.where.id) {
        if (table_data[parseInt(params.where.id, 10)]) {
          entity_array.push(table_data[parseInt(params.where.id, 10)])
        }
      } else {
        for (var id in table_data) {
          entity_array.push(table_data[id])
        }
      }
      var filters = [];
      if (params && params.group) {
        filters.push(this.createGroupBy(params.group))
      }
      if (params && params.where) {
        filters.push(this.createWhere(params.where))
      }
      if (params && params.order) {
        filters.push(this.createOrderBy(params.order))
      }
      if (params && params.limit || params.offset) {
        filters.push(this.createLimit(params.limit, params.offset))
      }
      for (var i = 0; i < filters.length; ++i) {
        entity_array = filters[i](entity_array)
      }
      return this.iterableFromResultSet(entity_array)
    },
    paramsFromSQLString: function paramsFromSQLString(sql) {
      var params = {};
      var select = /\s*SELECT\s+.+\s+FROM\s+(\w+)\s+/i;
      var select_match = sql.match(select);
      var table = select_match[1];
      sql = sql.replace(select, "");
      var fragments = [
        ["limit", /(^|\s+)LIMIT\s+(.+)$/i],
        ["order", /(^|\s+)ORDER\s+BY\s+(.+)$/i],
        ["group", /(^|\s+)GROUP\s+BY\s+(.+)$/i],
        ["where", /(^|\s+)WHERE\s+(.+)$/i]
      ];
      for (var i = 0; i < fragments.length; ++i) {
        var param_name = fragments[i][0];
        var matcher = fragments[i][1];
        var match = sql.match(matcher);
        if (match) {
          params[param_name] = match[2];
          sql = sql.replace(matcher, "")
        }
      }
      return [table, params]
    },
    transaction: function transaction(proceed) {
      var backup = {};
      for (var table_name in this.storage) {
        backup[table_name] = ActiveSupport.clone(this.storage[table_name])
      }
      try {
        proceed()
      } catch (e) {
        this.storage = backup;
        return ActiveSupport.throwError(e)
      }
    },
    iterableFromResultSet: function iterableFromResultSet(result) {
      result.iterate = function iterate(iterator) {
        if (typeof iterator === "number") {
          if (this[iterator]) {
            return ActiveSupport.clone(this[iterator])
          } else {
            return false
          }
        } else {
          for (var i = 0; i < this.length; ++i) {
            var row = ActiveSupport.clone(this[i]);
            iterator(row)
          }
        }
      };
      return result
    },
    setupTable: function setupTable(table) {
      if (!this.storage[table]) {
        this.storage[table] = {}
      }
    },
    createWhere: function createWhere(where) {
      if (ActiveSupport.isArray(where)) {
        var where_fragment = where[0];
        for (var i = 1; i < where.length; ++i) {
          where_fragment = where_fragment.replace(/\?/, ActiveRecord.escape(where[i]))
        }
        where = where_fragment
      }
      if (typeof where === "string") {
        return function json_result_where_processor(result_set) {
          var response = [];
          var where_parser = new WhereParser;
          var abstract_syntax_tree = where_parser.parse(where);
          for (var i = 0; i < result_set.length; ++i) {
            if (abstract_syntax_tree.execute(result_set[i], Adapters.InMemory.method_call_handler)) {
              response.push(result_set[i])
            }
          }
          return response
        }
      } else {
        return function json_result_where_processor(result_set) {
          var response = [];
          for (var i = 0; i < result_set.length; ++i) {
            var included = true;
            for (var column_name in where) {
              if ((new String(result_set[i][column_name])).toString() != (new String(where[column_name])).toString()) {
                included = false;
                break
              }
            }
            if (included) {
              response.push(result_set[i])
            }
          }
          return response
        }
      }
    },
    createLimit: function createLimit(limit, offset) {
      return function json_result_limit_processor(result_set) {
        return result_set.slice(offset || 0, limit)
      }
    },
    createGroupBy: function createGroupBy(group_by) {
      if (!group_by || group_by == "") {
        return function json_result_group_by_processor(result_set) {
          return result_set
        }
      }
      var group_key = group_by.replace(/(^[\s]+|[\s]+$)/g, "");
      return function json_result_group_by_processor(result_set) {
        var response = [];
        var indexed_by_group = {};
        for (var i = 0; i < result_set.length; ++i) {
          indexed_by_group[result_set[i][group_key]] = result_set[i]
        }
        for (var group_key_value in indexed_by_group) {
          response.push(indexed_by_group[group_key_value])
        }
        return response
      }
    },
    createOrderBy: function createOrderBy(order_by) {
      if (!order_by || order_by === "") {
        return function json_result_order_by_processor(result_set) {
          return result_set
        }
      }
      var order_statements = order_by.split(",");
      var trimmed_order_statements = [];
      for (var i = 0; i < order_statements.length; ++i) {
        trimmed_order_statements.push(order_statements[i].replace(/(^[\s]+|[\s]+$)/g, "").replace(/[\s]{2,}/g, "").toLowerCase())
      }
      return function json_result_order_by_processor(result_set) {
        for (var i = 0; i < trimmed_order_statements.length; ++i) {
          var trimmed_order_statements_bits = trimmed_order_statements[i].split(/\s/);
          var column_name = trimmed_order_statements_bits[0];
          var reverse = trimmed_order_statements_bits[1] && trimmed_order_statements_bits[1] === "desc";
          result_set = result_set.sort(function result_set_sorter(a, b) {
            return a[column_name] < b[column_name] ? -1 : a[column_name] > b[column_name] ? 1 : 0
          });
          if (reverse) {
            result_set = result_set.reverse()
          }
        }
        return result_set
      }
    },
    createTable: function createTable(table_name, columns) {
      if (!this.storage[table_name]) {
        this.storage[table_name] = {}
      }
    },
    dropTable: function dropTable(table_name) {
      delete this.storage[table_name]
    },
    addColumn: function addColumn(table_name, column_name, data_type) {
      return
    },
    removeColumn: function removeColumn(table_name, column_name) {
      return
    },
    addIndex: function addIndex(table_name, column_names, options) {
      return
    },
    removeIndex: function removeIndex(table_name, index_name) {
      return
    },
    fieldIn: function fieldIn(field, value) {
      if (value && value instanceof Date) {
        return ActiveSupport.dateFormat(value, "yyyy-mm-dd HH:MM:ss")
      }
      if (Migrations.objectIsFieldDefinition(field)) {
        field = this.getDefaultValueFromFieldDefinition(field)
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      return value
    },
    fieldOut: function fieldOut(field, value) {
      if (Migrations.objectIsFieldDefinition(field)) {
        if (field.type.toLowerCase().match(/date/) && typeof value == "string") {
          return ActiveSupport.dateFromDateTime(value)
        }
        field = this.getDefaultValueFromFieldDefinition(field)
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      return value
    }
  });
  Adapters.InMemory.method_call_handler = function method_call_handler(name, row, args) {
    if (!Adapters.InMemory.MethodCallbacks[name]) {
      name = name.toLowerCase().replace(/\_[0-9A-Z-a-z]/g, function camelize_underscores(match) {
        return match.toUpperCase()
      })
    }
    if (!Adapters.InMemory.MethodCallbacks[name]) {
      return ActiveSupport.throwError(Errors.MethodDoesNotExist)
    } else {
      return Adapters.InMemory.MethodCallbacks[name].apply(Adapters.InMemory.MethodCallbacks[name], [row].concat(args || []))
    }
  };
  Adapters.InMemory.MethodCallbacks = function () {
    var methods = {};
    var math_methods = ["abs", "acos", "asin", "atan", "atan2", "ceil", "cos", "exp", "floor", "log", "max", "min", "pow", "random", "round", "sin", "sqrt", "tan"];
    for (var i = 0; i < math_methods.length; ++i) {
      methods[math_methods[i]] = function math_method_generator(i) {
        return function generated_math_method() {
          return Math[math_methods[i]].apply(Math.math_methods[i], ActiveSupport.arrayFrom(arguments).slice(1))
        }
      }(i)
    }
    return methods
  }();
  Adapters.InMemory.connect = function (storage) {
    return new Adapters.InMemory(storage || {})
  };
  Adapters.Auto = {};
  Adapters.Auto.connect = function connect() {
    return Adapters.InMemory.connect.apply(Adapters.InMemory.connect, arguments)
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
  var IDENTIFIER_PATTERN = /^[a-zA-Z][a-zA-Z]*/;
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
  Lexeme.prototype.toString = function toString() {
    if (this.typeName) {
      return "[" + this.typeName + "]~" + this.text + "~"
    } else {
      return "[" + this.type + "]~" + this.text + "~"
    }
  };

  function WhereLexer() {
    this.setSource(null)
  }
  WhereLexer.prototype.setSource = function setSource(source) {
    this.source = source;
    this.offset = 0;
    this.length = source !== null ? source.length : 0;
    currentLexeme = null
  };
  WhereLexer.prototype.advance = function advance() {
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
        } else {
          if ((match = OPERATOR_PATTERN.exec(this.source)) !== null) {
            text = match[0];
            type = OperatorMap[text.toLowerCase()];
            result = new Lexeme(type, text)
          } else {
            if ((match = KEYWORD_PATTERN.exec(this.source)) !== null) {
              text = match[0];
              type = KeywordMap[text.toLowerCase()];
              result = new Lexeme(type, text)
            } else {
              if ((match = STRING_PATTERN.exec(this.source)) !== null) {
                result = new Lexeme(STRING, match[0])
              } else {
                if ((match = NUMBER_PATTERN.exec(this.source)) !== null) {
                  result = new Lexeme(NUMBER, match[0])
                } else {
                  if ((match = IDENTIFIER_PATTERN.exec(this.source)) !== null) {
                    result = new Lexeme(IDENTIFIER, match[0])
                  } else {
                    result = new Lexeme(ERROR, this.source)
                  }
                }
              }
            }
          }
        }
        if (TypeMap[result.type]) {
          result.typeName = TypeMap[result.type]
        }
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
  BinaryOperatorNode.prototype.execute = function execute(row, functionProvider) {
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
        return ActiveSupport.throwError(new Error("Unknown operator type: " + this.operator))
      }
    }
    return result
  };

  function IdentifierNode(identifier) {
    this.identifier = identifier
  }
  IdentifierNode.prototype.execute = function execute(row, functionProvider) {
    return row[this.identifier]
  };

  function FunctionNode(name, args) {
    this.name = name;
    this.args = args
  }
  FunctionNode.prototype.execute = function execute(row, functionProvider) {
    var args = new Array(this.args.length);
    for (var i = 0; i < this.args.length; i++) {
      args[i] = this.args[i].execute(row, functionProvider)
    }
    return functionProvider(this.name, row, args)
  };

  function ScalarNode(value) {
    this.value = value
  }
  ScalarNode.prototype.execute = function execute(row, functionProvider) {
    return this.value
  };
  WhereParser = function WhereParser() {
    this._lexer = new WhereLexer
  };
  WhereParser.prototype.parse = function parse(source) {
    var result = null;
    currentLexeme = null;
    this._lexer.setSource(source);
    this._lexer.advance();
    while (currentLexeme !== null) {
      switch (currentLexeme.type) {
      case IDENTIFIER:
        ;
      case FALSE:
        ;
      case LPAREN:
        ;
      case NUMBER:
        ;
      case STRING:
        ;
      case TRUE:
        result = this.parseInExpression();
        break;
      default:
        throw new Error("Unrecognized starting token in where-clause:" + this._lexer.currentLexeme);
        return ActiveSupport.throwError(new Error("Unrecognized starting token in where-clause:" + this._lexer.currentLexeme))
      }
    }
    return result
  };
  WhereParser.prototype.parseInExpression = function parseInExpression() {
    var result = this.parseOrExpression();
    while (currentLexeme !== null && currentLexeme.type === IN) {
      this._lexer.advance();
      var rhs = [];
      if (currentLexeme !== null && currentLexeme.type === LPAREN) {
        this._lexer.advance();
        while (currentLexeme !== null) {
          rhs.push(this.parseOrExpression());
          if (currentLexeme !== null && currentLexeme.type === COMMA) {
            this._lexer.advance()
          } else {
            break
          }
        }
        if (currentLexeme !== null && currentLexeme.type === RPAREN) {
          this._lexer.advance();
          result = new BinaryOperatorNode(result, IN, rhs)
        } else {
          return ActiveSupport.throwError(new Error("'in' list did not end with a right parenthesis." + currentLexeme))
        }
      } else {
        return ActiveSupport.throwError(new Error("'in' list did not start with a left parenthesis"))
      }
    }
    return result
  };
  WhereParser.prototype.parseOrExpression = function parseOrExpression() {
    var result = this.parseAndExpression();
    while (currentLexeme !== null && currentLexeme.type === OR) {
      this._lexer.advance();
      var rhs = this.parseAndExpression();
      result = new BinaryOperatorNode(result, OR, rhs)
    }
    return result
  };
  WhereParser.prototype.parseAndExpression = function parseAndExpression() {
    var result = this.parseEqualityExpression();
    while (currentLexeme !== null && currentLexeme.type === AND) {
      this._lexer.advance();
      var rhs = this.parseEqualityExpression();
      result = new BinaryOperatorNode(result, AND, rhs)
    }
    return result
  };
  WhereParser.prototype.parseEqualityExpression = function parseEqualityExpression() {
    var result = this.parseRelationalExpression();
    if (currentLexeme !== null) {
      var type = currentLexeme.type;
      switch (type) {
      case EQUAL:
        ;
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
        ;
      case LESS_THAN_EQUAL:
        ;
      case GREATER_THAN:
        ;
      case GREATER_THAN_EQUAL:
        this._lexer.advance();
        var rhs = this.parseMemberExpression();
        result = new BinaryOperatorNode(result, type, rhs);
        break
      }
    }
    return result
  };
  WhereParser.prototype.parseMemberExpression = function parseMemberExpression() {
    var result = null;
    if (currentLexeme !== null) {
      switch (currentLexeme.type) {
      case IDENTIFIER:
        result = new IdentifierNode(currentLexeme.text);
        this._lexer.advance();
        if (currentLexeme !== null && currentLexeme.type === LPAREN) {
          var name = result.identifier;
          var args = [];
          this._lexer.advance();
          while (currentLexeme !== null && currentLexeme.type !== RPAREN) {
            args.push(this.parseOrExpression());
            if (currentLexeme !== null && currentLexeme.type === COMMA) {
              this._lexer.advance()
            }
          }
          if (currentLexeme !== null) {
            this._lexer.advance();
            result = new FunctionNode(name, args)
          } else {
            return ActiveSupport.throwError(new Error("Function argument list was not closed with a right parenthesis."))
          }
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
        if (currentLexeme !== null && currentLexeme.type === RPAREN) {
          this._lexer.advance()
        } else {
          return ActiveSupport.throwError(new Error("Missing closing right parenthesis: " + currentLexeme))
        }
        break
      }
    }
    return result
  };
  ActiveRecord.WhereParser = WhereParser;
  var Finders = {
    mergeOptions: function mergeOptions(field_name, value, options) {
      if (!options) {
        options = {}
      }
      options = ActiveSupport.clone(options);
      if (options.where) {
        options.where[field_name] = value
      } else {
        options.where = {};
        options.where[field_name] = value
      }
      return options
    },
    generateFindByField: function generateFindByField(klass, field_name) {
      klass["findBy" + ActiveSupport.camelize(field_name, true)] = ActiveSupport.curry(function generated_find_by_field_delegator(klass, field_name, value, options) {
        return klass.find(ActiveSupport.extend(Finders.mergeOptions(field_name, value, options), {
          first: true
        }))
      }, klass, field_name)
    },
    generateFindAllByField: function generateFindAllByField(klass, field_name) {
      klass["findAllBy" + ActiveSupport.camelize(field_name, true)] = ActiveSupport.curry(function generated_find_all_by_field_delegator(klass, field_name, value, options) {
        return klass.find(ActiveSupport.extend(Finders.mergeOptions(field_name, value, options), {
          all: true
        }))
      }, klass, field_name)
    }
  };
  ActiveRecord.Finders = Finders;
  var ResultSet = {};
  ResultSet.InstanceMethods = {
    reload: function reload(result_set, params, model) {
      result_set.length = 0;
      var new_response = model.find(ActiveSupport.extend(ActiveSupport.clone(params), {
        synchronize: false
      }));
      for (var i = 0; i < new_response.length; ++i) {
        result_set.push(new_response[i])
      }
    },
    toArray: function toArray(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) {
        items.push(result_set[i].toObject())
      }
      return items
    },
    toJSON: function toJSON(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) {
        items.push(result_set[i].toSerializableObject())
      }
      return items
    },
    toXML: function toXML(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) {
        items.push(result_set[i].toSerializableObject())
      }
      return ActiveSupport.XMLFromObject(ActiveSupport.Inflector.pluralize(model.modelName), items)
    }
  };
  var Relationships = {
    normalizeModelName: function (related_model_name) {
      var plural = ActiveSupport.camelize(related_model_name, true);
      var singular = ActiveSupport.Inflector.singularize(plural) || plural;
      return singular || plural
    },
    normalizeForeignKey: function (foreign_key, related_model_name) {
      var plural = ActiveSupport.underscore(related_model_name).toLowerCase();
      var singular = ActiveSupport.Inflector.singularize(plural) || plural;
      if (!foreign_key || typeof foreign_key === "undefined") {
        return (singular || plural) + "_id"
      } else {
        return foreign_key
      }
    }
  };
  ActiveRecord.Relationships = Relationships;
  ActiveRecord.ClassMethods.hasOne = function hasOne(related_model_name, options) {
    if (related_model_name && related_model_name.modelName) {
      related_model_name = related_model_name.modelName
    }
    if (!options) {
      options = {}
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, Relationships.normalizeModelName(related_model_name));
    var class_methods = {};
    var instance_methods = {};
    instance_methods["get" + relationship_name] = ActiveSupport.curry(function getRelated(related_model_name, foreign_key) {
      var id = this.get(foreign_key);
      if (id) {
        return ActiveRecord.Models[related_model_name].find(id)
      } else {
        return false
      }
    }, related_model_name, foreign_key);
    class_methods["build" + relationship_name] = instance_methods["build" + relationship_name] = ActiveSupport.curry(function buildRelated(related_model_name, foreign_key, params) {
      return ActiveRecord.Models[related_model_name].build(params || {})
    }, related_model_name, foreign_key);
    instance_methods["create" + relationship_name] = ActiveSupport.curry(function createRelated(related_model_name, foreign_key, params) {
      var record = ActiveRecord.Models[related_model_name].create(params || {});
      if (this.get(this.constructor.primaryKeyName)) {
        this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName))
      }
      return record
    }, related_model_name, foreign_key);
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    if (options.dependent) {
      this.observe("afterDestroy", function destroyRelatedDependent(record) {
        var child = record["get" + relationship_name]();
        if (child) {
          child.destroy()
        }
      })
    }
  };
  ActiveRecord.ClassMethods.hasMany = function hasMany(related_model_name, options) {
    if (related_model_name && related_model_name.modelName) {
      related_model_name = related_model_name.modelName
    }
    if (!options) {
      options = {}
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var original_related_model_name = related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, Relationships.normalizeModelName(this.modelName));
    var class_methods = {};
    var instance_methods = {};
    if (options.through) {
      var through_model_name = Relationships.normalizeModelName(options.through);
      instance_methods["get" + relationship_name + "List"] = ActiveSupport.curry(function getRelatedListForThrough(through_model_name, related_model_name, foreign_key, params) {
        var related_list = this["get" + through_model_name + "List"]();
        var ids = [];
        var response = [];
        for (var i = 0; i < related_list.length; ++i) {
          response.push(related_list[i]["get" + related_model_name]())
        }
        return response
      }, through_model_name, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "Count"] = ActiveSupport.curry(function getRelatedCountForThrough(through_model_name, related_model_name, foreign_key, params) {
        if (!params) {
          params = {}
        }
        if (!params.where) {
          params.where = {}
        }
        params.where[foreign_key] = this.get(this.constructor.primaryKeyName);
        return ActiveRecord.Models[through_model_name].count(params)
      }, through_model_name, related_model_name, foreign_key)
    } else {
      instance_methods["destroy" + relationship_name] = class_methods["destroy" + relationship_name] = ActiveSupport.curry(function destroyRelated(related_model_name, foreign_key, params) {
        var record = ActiveRecord.Models[related_model_name].find(params && typeof params.get === "function" ? params.get(params.constructor.primaryKeyName) : params);
        if (record) {
          return record.destroy()
        } else {
          return false
        }
      }, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "List"] = ActiveSupport.curry(function getRelatedList(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!id) {
          return this.constructor.resultSetFromArray([])
        }
        if (!params) {
          params = {}
        }
        if (options.order) {
          params.order = options.order
        }
        if (options.synchronize) {
          params.synchronize = options.synchronize
        }
        if (!params.where) {
          params.where = {}
        }
        params.where[foreign_key] = id;
        params.all = true;
        return ActiveRecord.Models[related_model_name].find(params)
      }, related_model_name, foreign_key);
      instance_methods["get" + relationship_name + "Count"] = ActiveSupport.curry(function getRelatedCount(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!id) {
          return 0
        }
        if (!params) {
          params = {}
        }
        if (!params.where) {
          params.where = {}
        }
        params.where[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].count(params)
      }, related_model_name, foreign_key);
      instance_methods["build" + relationship_name] = ActiveSupport.curry(function buildRelated(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!params) {
          params = {}
        }
        params[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].build(params)
      }, related_model_name, foreign_key);
      instance_methods["create" + relationship_name] = ActiveSupport.curry(function createRelated(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!params) {
          params = {}
        }
        params[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].create(params)
      }, related_model_name, foreign_key)
    }
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    if (options.dependent) {
      this.observe("afterDestroy", function destroyDependentChildren(record) {
        var list = record["get" + relationship_name + "List"]();
        ActiveRecord.connection.log("Relationships.hasMany destroy " + list.length + " dependent " + related_model_name + " children of " + record.modelName);
        for (var i = 0; i < list.length; ++i) {
          list[i].destroy()
        }
      })
    }
  };
  ActiveRecord.ClassMethods.belongsTo = function belongsTo(related_model_name, options) {
    if (related_model_name && related_model_name.modelName) {
      related_model_name = related_model_name.modelName
    }
    if (!options) {
      options = {}
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, related_model_name);
    var class_methods = {};
    var instance_methods = {};
    instance_methods["get" + relationship_name] = ActiveSupport.curry(function getRelated(related_model_name, foreign_key) {
      var id = this.get(foreign_key);
      if (id) {
        return ActiveRecord.Models[related_model_name].find(id)
      } else {
        return false
      }
    }, related_model_name, foreign_key);
    instance_methods["build" + relationship_name] = class_methods["build" + relationship_name] = ActiveSupport.curry(function buildRelated(related_model_name, foreign_key, params) {
      var record = ActiveRecord.Models[related_model_name].build(params || {});
      if (options.counter) {
        record[options.counter] = 1
      }
      return record
    }, related_model_name, foreign_key);
    instance_methods["create" + relationship_name] = ActiveSupport.curry(function createRelated(related_model_name, foreign_key, params) {
      var record = this["build" + related_model_name](params);
      if (record.save() && this.get(this.constructor.primaryKeyName)) {
        this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName))
      }
      return record
    }, related_model_name, foreign_key);
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    if (options.counter) {
      this.observe("afterDestroy", function decrementBelongsToCounter(record) {
        var child = record["get" + relationship_name]();
        if (child) {
          var current_value = child.get(options.counter);
          if (typeof current_value === "undefined") {
            current_value = 0
          }
          child.updateAttribute(options.counter, Math.max(0, parseInt(current_value, 10) - 1))
        }
      });
      this.observe("afterCreate", function incrementBelongsToCounter(record) {
        var child = record["get" + relationship_name]();
        if (child) {
          var current_value = child.get(options.counter);
          if (typeof current_value === "undefined") {
            current_value = 0
          }
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
      "bitint": 0,
      "float": 0,
      "double": 0,
      "bouble precision": 0,
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
    migrate: function migrate(target) {
      if (typeof target === "undefined" || target === false) {
        target = Migrations.max()
      }
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
        } else {
          if (target < current_version) {
            migrations = Migrations.collectBelowIndex(current_version, target);
            for (i = 0; i < migrations.length; ++i) {
              ActiveRecord.connection.log("Migrating down to version " + migrations[i][0]);
              migrations[i][1].down(Migrations.Schema)
            }
            versions = Migrations.Meta.find({
              all: true
            });
            for (i = 0; i < versions.length; ++i) {
              if (versions[i].get("version") > target) {
                versions[i].destroy()
              }
            }
            ActiveRecord.connection.log("Migrate to version " + target + " complete.")
          } else {
            ActiveRecord.connection.log("Current schema version is current, no migrations were run.")
          }
        }
      }, function (e) {
        ActiveRecord.connection.log("Migration failed: " + e)
      });
      ActiveRecord.connection.log("Migrations.migrate(" + target + ") finished.")
    },
    current: function current() {
      Migrations.setup();
      return Migrations.Meta.max("version") || 0
    },
    max: function max() {
      var max_val = 0;
      for (var key_name in Migrations.migrations) {
        key_name = parseInt(key_name, 10);
        if (key_name > max_val) {
          max_val = key_name
        }
      }
      return max_val
    },
    setup: function setMigrationsTable() {
      if (!Migrations.Meta) {
        Migrations.Meta = ActiveRecord.create("schema_migrations", {
          version: 0
        });
        delete ActiveRecord.Models.SchemaMigrations
      }
    },
    collectBelowIndex: function collectBelowIndex(index, target) {
      return [[index, Migrations.migrations[index]]].concat(Migrations.collectMigrations(index, target + 1, "down"))
    },
    collectAboveIndex: function collectAboveIndex(index, target) {
      return Migrations.collectMigrations(index, target, "up")
    },
    collectMigrations: function collectMigrations(index, target, direction) {
      var keys = [];
      for (var key_name in Migrations.migrations) {
        key_name = parseInt(key_name, 10);
        if (direction === "up" && key_name > index || direction === "down" && key_name < index) {
          keys.push(key_name)
        }
      }
      keys = keys.sort();
      if (direction === "down") {
        keys = keys.reverse()
      }
      var migrations = [];
      for (var i = 0; i < keys.length; ++i) {
        if (direction === "down" && typeof target !== "undefined" && target > keys[i] || direction === "up" && typeof target !== "undefined" && target < keys[i]) {
          break
        }
        migrations.push([keys[i], Migrations.migrations[keys[i]]])
      }
      return migrations
    },
    objectIsFieldDefinition: function objectIsFieldDefinition(object) {
      return typeof object === "object" && ActiveSupport.keys(object).length === 2 && "type" in object && "value" in object
    },
    Schema: {
      createTable: function createTable(table_name, columns) {
        return ActiveRecord.connection.createTable(table_name, columns)
      },
      dropTable: function dropTable(table_name) {
        return ActiveRecord.connection.dropTable(table_name)
      },
      addColumn: function addColumn(table_name, column_name, data_type) {
        return ActiveRecord.connection.addColumn(table_name, column_name, data_type)
      },
      dropColumn: function removeColumn(table_name, column_name) {
        return ActiveRecord.connection.dropColumn(table_name, column_name)
      },
      addIndex: function addIndex(table_name, column_names, options) {
        return ActiveRecord.connection.addIndex(table_name, column_names, options)
      },
      removeIndex: function removeIndex(table_name, index_name) {
        return ActiveRecord.connection.removeIndex(table_name, index_name)
      }
    }
  };
  ActiveRecord.Migrations = Migrations;
  ActiveSupport.extend(ActiveRecord.ClassMethods, {
    addValidator: function addValidator(validator) {
      if (!this._validators) {
        this._validators = []
      }
      this._validators.push(validator)
    },
    validatesPresenceOf: function validatesPresenceOf(field, options) {
      options = ActiveSupport.extend({}, options || {});
      this.addValidator(function validates_presence_of_callback() {
        if (!this.get(field) || this.get(field) === "") {
          this.addError(options.message || field + " is not present.")
        }
      })
    },
    validatesLengthOf: function validatesLengthOf(field, options) {
      options = ActiveSupport.extend({
        min: 1,
        max: 9999
      }, options || {});
      this.addValidator(function validates_length_of_callback() {
        var value = new String(this.get(field));
        if (value.length < options.min) {
          this.addError(options.message || field + " is too short.")
        }
        if (value.length > options.max) {
          this.addError(options.message || field + " is too long.")
        }
      })
    }
  });
  ActiveSupport.extend(ActiveRecord.InstanceMethods, {
    addError: function addError(str, field) {
      var error = null;
      if (field) {
        error = [str, field];
        error.toString = function toString() {
          return str
        }
      } else {
        error = str
      }
      this._errors.push(str)
    },
    _valid: function _valid() {
      this._errors = [];
      var validators = this._getValidators();
      for (var i = 0; i < validators.length; ++i) {
        validators[i].apply(this)
      }
      if (typeof this.valid === "function") {
        this.valid()
      }
      ActiveRecord.connection.log("ActiveRecord.valid()? " + (new String(this._errors.length === 0)).toString() + (this._errors.length > 0 ? ". Errors: " + (new String(this._errors)).toString() : ""));
      return this._errors.length === 0
    },
    _getValidators: function _getValidators() {
      return this.constructor._validators || []
    },
    getErrors: function getErrors() {
      return this._errors
    }
  });
  ActiveRecord.asynchronous = false;
  var Synchronization = {};
  Synchronization.calculationNotifications = {};
  Synchronization.resultSetNotifications = {};
  Synchronization.notifications = {};
  Synchronization.setupNotifications = function setupNotifications(record) {
    if (!record.get(record.constructor.primaryKeyName)) {
      return false
    }
    if (!Synchronization.notifications[record.tableName]) {
      Synchronization.notifications[record.tableName] = {}
    }
    if (!Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]]) {
      Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]] = {}
    }
    return true
  };
  Synchronization.triggerSynchronizationNotifications = function triggerSynchronizationNotifications(record, event_name) {
    var found_records, internal_count_id;
    if (!Synchronization.setupNotifications(record)) {
      return false
    }
    if (event_name === "afterSave") {
      found_records = Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]];
      for (internal_count_id in found_records) {
        if (internal_count_id !== record.internalCount) {
          var found_record = found_records[internal_count_id];
          var keys = found_record.keys();
          for (var i = 0; i < keys.length; ++i) {
            var key_name = keys[i];
            found_record.set(key_name, record.get(key_name))
          }
          found_record.notify("synchronization:afterSave")
        }
      }
    } else {
      if (event_name === "afterDestroy" || event_name === "afterCreate") {
        if (Synchronization.calculationNotifications[record.tableName]) {
          for (var synchronized_calculation_count in Synchronization.calculationNotifications[record.tableName]) {
            Synchronization.calculationNotifications[record.tableName][synchronized_calculation_count]()
          }
        }
        if (Synchronization.resultSetNotifications[record.tableName]) {
          for (var synchronized_result_set_count in Synchronization.resultSetNotifications[record.tableName]) {
            var old_result_set = Synchronization.resultSetNotifications[record.tableName][synchronized_result_set_count].resultSet;
            var new_params = ActiveSupport.clone(Synchronization.resultSetNotifications[record.tableName][synchronized_result_set_count].params);
            var new_result_set = record.constructor.find(ActiveSupport.extend(new_params, {
              synchronize: false
            }));
            var splices = Synchronization.spliceArgumentsFromResultSetDiff(old_result_set, new_result_set, event_name);
            for (var x = 0; x < splices.length; ++x) {
              if (event_name == "afterCreate") {
                var to_synchronize = splices[x].slice(2);
                for (var s = 0; s < to_synchronize.length; ++s) {
                  to_synchronize[s].synchronize()
                }
              }
              old_result_set.splice.apply(old_result_set, splices[x])
            }
          }
        }
        if (event_name === "afterDestroy") {
          found_records = Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]];
          for (internal_count_id in found_records) {
            if (internal_count_id !== record.internalCount) {
              found_records[internal_count_id].notify("synchronization:afterDestroy");
              Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]][internal_count_id] = null;
              delete Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]][internal_count_id]
            }
          }
        }
      }
    }
  };
  ActiveSupport.extend(ActiveRecord.InstanceMethods, {
    synchronize: function synchronize() {
      if (!this.isSynchronized) {
        this.isSynchronized = true;
        Synchronization.setupNotifications(this);
        Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount] = this
      }
    },
    stop: function stop() {
      Synchronization.setupNotifications(this);
      Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount] = null;
      delete Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount]
    }
  });
  Synchronization.synchronizedCalculationCount = 0;
  Synchronization.synchronizeCalculation = function synchronizeCalculation(klass, operation, params) {
    ++Synchronization.synchronizedCalculationCount;
    var callback = params.synchronize;
    var callback_params = ActiveSupport.clone(params);
    delete callback_params.synchronize;
    if (!Synchronization.calculationNotifications[klass.tableName]) {
      Synchronization.calculationNotifications[klass.tableName] = {}
    }
    Synchronization.calculationNotifications[klass.tableName][Synchronization.synchronizedCalculationCount] = function calculation_synchronization_executer_generator(klass, operation, params, callback) {
      return function calculation_synchronization_executer() {
        callback(klass[operation](callback_params))
      }
    }(klass, operation, params, callback);
    Synchronization.calculationNotifications[klass.tableName][Synchronization.synchronizedCalculationCount]();
    return function calculation_synchronization_stop_generator(table_name, synchronized_calculation_count) {
      return function calculation_synchronization_stop() {
        Synchronization.calculationNotifications[table_name][synchronized_calculation_count] = null;
        delete Synchronization.calculationNotifications[table_name][synchronized_calculation_count]
      }
    }(klass.tableName, Synchronization.synchronizedCalculationCount)
  };
  Synchronization.synchronizedResultSetCount = 0;
  Synchronization.synchronizeResultSet = function synchronizeResultSet(klass, params, result_set) {
    ++Synchronization.synchronizedResultSetCount;
    if (!Synchronization.resultSetNotifications[klass.tableName]) {
      Synchronization.resultSetNotifications[klass.tableName] = {}
    }
    Synchronization.resultSetNotifications[klass.tableName][Synchronization.synchronizedResultSetCount] = {
      resultSet: result_set,
      params: params
    };
    for (var i = 0; i < result_set.length; ++i) {
      result_set[i].synchronize()
    }
    result_set.stop = function result_set_synchronization_stop_generator(table_name, synchronized_result_set_count) {
      return function stop() {
        for (var i = 0; i < this.length; ++i) {
          this[i].stop()
        }
        Synchronization.resultSetNotifications[table_name][synchronized_result_set_count] = null;
        delete Synchronization.resultSetNotifications[table_name][synchronized_result_set_count]
      }
    }(klass.tableName, Synchronization.synchronizedResultSetCount)
  };
  Synchronization.spliceArgumentsFromResultSetDiff = function spliceArgumentsFromResultSetDiff(a, b, event_name) {
    var diffs = [];
    if (event_name === "afterCreate") {
      for (var i = 0; i < b.length; ++i) {
        if (!a[i] || a[i] && a[i][a[i].constructor.primaryKeyName] !== b[i][b[i].constructor.primaryKeyName]) {
          diffs.push([i, null, b[i]]);
          break
        }
      }
    } else {
      if (event_name === "afterDestroy") {
        for (var i = 0; i < a.length; ++i) {
          if (!b[i] || b[i] && b[i][b[i].constructor.primaryKeyName] !== a[i][a[i].constructor.primaryKeyName]) {
            diffs.push([i, 1]);
            break
          }
        }
      }
    }
    return diffs
  };
  ActiveRecord.Synchronization = Synchronization;

  /**
   * Adapter for Microsoft Access
   *
   * Requires lib_msaccess
   *
   */
  ActiveRecord.Adapters.msaccess = function() {
    ActiveSupport.extend(this, ActiveRecord.Adapters.InstanceMethods);
    ActiveSupport.extend(this, ActiveRecord.Adapters.SQL);
    ActiveSupport.extend(this, {
      wrap: function(field) {
        return '[' + field + ']';
      },
      executeSQL: function executeSQL(sql) {
        var params = ActiveSupport.arrayFrom(arguments).slice(1);
        var i = 0;
        sql = sql.replace(/\?/g, function() {
          return '$' + (++i);
        });
        ActiveRecord.connection.log("Adapters.msaccess.executeSQL: " + sql + " [" + params.join(',') + "]");
        var query = ActiveRecord.Adapters.msaccess.db.query(sql, params);
        return query.getAll();
      },
      getLastInsertedRowId: function getLastInsertedRowId() {
        var rec = ActiveRecord.Adapters.msaccess.db.query('SELECT @@IDENTITY AS [val]').getOne();
        return rec.val;
      },
      getDefaultColumnDefinitionFragmentFromValue: function getDefaultColumnDefinitionFragmentFromValue(value) {
        if (typeof value === "string") {
          return "TEXT(255)"
        }
        if (typeof value === "number") {
          return "INT"
        }
        if (typeof value == "boolean") {
          return "BIT"
        }
        return "MEMO"
      },
      createTable: function createTable(table_name, columns) {
        var keys = ActiveSupport.keys(columns);
        var fragments = [];
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (columns[key].primaryKey) {
            var type = columns[key].type || "COUNTER";
            fragments.unshift("[" + key + "] " + type + " CONSTRAINT [pk_" + key + "] PRIMARY KEY")
          } else {
            fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns))
          }
        }
        return this.executeSQL("CREATE TABLE [" + table_name + "] (" + fragments.join(", ") + ")")
      },
      iterableFromResultSet: function iterableFromResultSet(result) {
        result.iterate = ActiveRecord.Adapters.defaultResultSetIterator;
        return result;
      }
    });
  };

  ActiveRecord.Adapters.msaccess.connect = function connect(options) {
    if (!options) {
      options = {};
    }
    var msa = lib('msaccess');
    var name = options.name || 'main';
    ActiveRecord.Adapters.msaccess.db = msa.open(name);
    //ActiveRecord.Adapters.msaccess.connection = {};

    return new ActiveRecord.Adapters.msaccess();
  };

  return ActiveRecord
}

