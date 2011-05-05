/*!
 * ActiveSupport
 *
 * Provides a number of methods from the Prototype.js framework, without modifying any built in
 * prototypes to ensure compatibility and portability.
 */
if (!this.lib_activesupport) this.lib_activesupport = lib_activesupport;
function lib_activesupport() {
  var ActiveSupport;

  ActiveSupport = {
    log: function log() {
      if (typeof console !== "undefined") console.log.apply(this, arguments)
    },
    createError: function createError(message) {
      return {
        getErrorString: function getErrorString() {
          var output = String(message);
          for (var i = 0; i < arguments.length; ++i) output = output.replace(/\%/, arguments[i].toString ? arguments[i].toString() : String(arguments[i]));
          return output
        }
      }
    }
  };
  ActiveSupport.Array = {
    from: function from(object) {
      if (!object) return [];
      var length = object.length || 0;
      var results = new Array(length);
      while (length--) results[length] = object[length];
      return results
    },
    indexOf: function indexOf(array, item, i) {
      if (Array.prototype.indexOf) return array.indexOf(item, i);
      i = i || 0;
      var length = array.length;
      if (i < 0) i = length + i;
      for (; i < length; i++) if (array[i] === item) return i;
      return -1
    },
    without: function without(arr) {
      var values = ActiveSupport.Array.from(arguments).slice(1);
      var response = [];
      for (var i = 0; i < arr.length; i++) if (!(ActiveSupport.Array.indexOf(values, arr[i]) > -1)) response.push(arr[i]);
      return response
    },
    map: function map(array, iterator, context) {
      var length = array.length;
      context = context || window;
      var response = new Array(length);
      for (var i = 0; i < length; ++i) if (array[i]) response[i] = iterator.call(context, array[i], i, array);
      return response
    }
  };
  ActiveSupport.Function = {
    methodize: function methodize(func) {
      if (func._methodized) return func._methodized;
      return func._methodized = function () {
        return func.apply(null, [this].concat(ActiveSupport.Array.from(arguments)))
      }
    },
    bind: function bind(func, object) {
      if (typeof object == "undefined") return func;
      if (arguments.length < 3) return function bound() {
        return func.apply(object, arguments)
      };
      else {
        var args = ActiveSupport.Array.from(arguments);
        args.shift();
        args.shift();
        return function bound() {
          return func.apply(object, args.concat(ActiveSupport.Array.from(arguments)))
        }
      }
    },
    bindAndCurryFromArgumentsAboveIndex: function bindAndCurryFromArgumentsAboveIndex(func, arguments, length) {
      if (arguments.length - length > 0) {
        var arguments_array = ActiveSupport.Array.from(arguments);
        var arguments_for_bind = arguments_array.slice(length);
        arguments_for_bind.unshift(func);
        return ActiveSupport.Function.bind.apply(ActiveSupport, arguments_for_bind)
      } else return func
    },
    curry: function curry(func) {
      if (arguments.length == 1) return func;
      var args = ActiveSupport.Array.from(arguments).slice(1);
      return function curried() {
        return func.apply(this, args.concat(ActiveSupport.Array.from(arguments)))
      }
    },
    wrap: function wrap(func, wrapper) {
      return function wrapped() {
        return wrapper.apply(this, [ActiveSupport.Function.bind(func, this)].concat(ActiveSupport.Array.from(arguments)))
      }
    }
  };
  ActiveSupport.String = {
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
    trim: function trim(str) {
      return (str || "").replace(/^\s+|\s+$/g, "")
    },
    scriptFragment: "<script[^>]*>([\\S\\s]*?)<\/script>",
    evalScripts: function evalScripts(str) {
      var match_all = new RegExp(ActiveSupport.String.scriptFragment, "img");
      var match_one = new RegExp(ActiveSupport.String.scriptFragment, "im");
      var matches = str.match(match_all) || [];
      for (var i = 0; i < matches.length; ++i) eval((matches[i].match(match_one) || ["", ""])[1])
    },
    stripScripts: function stripScripts(str) {
      return str.replace(new RegExp(ActiveSupport.String.scriptFragment, "img"), "")
    }
  };
  ActiveSupport.Number = {};
  ActiveSupport.Object = {
    isArray: function isArray(object) {
      return object && typeof object == "object" && "length" in object && "splice" in object && "join" in object
    },
    keys: function keys(object) {
      var keys_array = [];
      for (var property_name in object) keys_array.push(property_name);
      return keys_array
    },
    values: function values(object) {
      var values_array = [];
      for (var property_name in object) values_array.push(object[property_name]);
      return values_array
    },
    extend: function extend(destination, source) {
      for (var property in source) destination[property] = source[property];
      return destination
    },
    clone: function clone(object) {
      return ActiveSupport.Object.extend({}, object)
    }
  };
  ActiveSupport.Inflections = {
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
    uncountable: ["sheep", "fish", "series", "species", "money", "rice", "information", "info", "equipment", "media"]
  };
  ActiveSupport.Object.extend(ActiveSupport.Number, {
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
    }
  });
  ActiveSupport.Object.extend(ActiveSupport.String, {
    pluralize: function pluralize(word) {
      var i, lc = word.toLowerCase();
      for (i = 0; i < ActiveSupport.Inflections.uncountable.length; i++) {
        var uncountable = ActiveSupport.Inflections.uncountable[i];
        if (lc === uncountable) return word
      }
      for (i = 0; i < ActiveSupport.Inflections.irregular.length; i++) {
        var singular = ActiveSupport.Inflections.irregular[i][0];
        var plural = ActiveSupport.Inflections.irregular[i][1];
        if (lc === singular || lc === plural) return plural
      }
      for (i = 0; i < ActiveSupport.Inflections.plural.length; i++) {
        var regex = ActiveSupport.Inflections.plural[i][0];
        var replace_string = ActiveSupport.Inflections.plural[i][1];
        if (regex.test(word)) return word.replace(regex, replace_string)
      }
      return word
    },
    singularize: function singularize(word) {
      var i, lc = word.toLowerCase();
      for (i = 0; i < ActiveSupport.Inflections.uncountable.length; i++) {
        var uncountable = ActiveSupport.Inflections.uncountable[i];
        if (lc === uncountable) return word
      }
      for (i = 0; i < ActiveSupport.Inflections.irregular.length; i++) {
        var singular = ActiveSupport.Inflections.irregular[i][0];
        var plural = ActiveSupport.Inflections.irregular[i][1];
        if (lc === singular || lc === plural) return singular
      }
      for (i = 0; i < ActiveSupport.Inflections.singular.length; i++) {
        var regex = ActiveSupport.Inflections.singular[i][0];
        var replace_string = ActiveSupport.Inflections.singular[i][1];
        if (regex.test(word)) return word.replace(regex, replace_string)
      }
      return word
    }
  });
  ActiveSupport.dateFromDateTime = function dateFromDateTime(date_time) {
    var parts = date_time.replace(/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/, "$1 $2 $3 $4 $5 $6").split(" ");
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])
  };
  ActiveSupport.dateFormat = function date_format_wrapper() {
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
        if (isNaN(date)) throw new SyntaxError("invalid date");
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
  }();
  ActiveSupport.JSON = lib("json");
  ActiveSupport.CallbackQueue = function CallbackQueue(on_complete) {
    on_complete = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(on_complete ||
    function () {}, arguments, 1);
    this.stack = [];
    this.waiting = {};
    if (on_complete) this.setOnComplete(on_complete ||
    function () {})
  };
  ActiveSupport.CallbackQueue.prototype.setOnComplete = function setOnComplete(on_complete) {
    this.onComplete = on_complete
  };
  ActiveSupport.CallbackQueue.prototype.push = function push(callback) {
    callback = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(callback ||
    function () {}, arguments, 1);
    var wrapped = ActiveSupport.Function.wrap(callback, ActiveSupport.Function.bind(function callback_queue_wrapper(proceed) {
      var i = null;
      var index = ActiveSupport.Array.indexOf(this.stack, wrapped);
      this.waiting[index] = [proceed, ActiveSupport.Array.from(arguments).slice(1)];
      var all_present = true;
      for (i = 0; i < this.stack.length; ++i) if (!this.waiting[i]) all_present = false;
      if (all_present) for (i = 0; i < this.stack.length; ++i) {
        var item = this.waiting[i];
        item[0].apply(item[0], item[1]);
        delete this.waiting[i]
      }
      if (all_present && i === this.stack.length) if (this.onComplete) this.onComplete()
    }, this));
    this.stack.push(wrapped);
    return wrapped
  }

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

  ActiveEvent = {};

  ActiveEvent.extend = function extend(object) {
    object._objectEventSetup = function _objectEventSetup(event_name) {
      if (!this._observers) this._observers = {};
      if (!(event_name in this._observers)) this._observers[event_name] = []
    };
    object.observe = function observe(event_name, observer, context) {
      observer = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(observer, arguments, 2);
      if (typeof event_name === "string" && typeof observer !== "undefined") {
        this._objectEventSetup(event_name);
        if (!(ActiveSupport.Array.indexOf(this._observers[event_name], observer) > -1)) this._observers[event_name].push(observer)
      } else for (var e in event_name) this.observe(e, event_name[e]);
      return observer
    };
    object.stopObserving = function stopObserving(event_name, observer) {
      this._objectEventSetup(event_name);
      if (event_name && observer) this._observers[event_name] = ActiveSupport.Array.without(this._observers[event_name], observer);
      else if (event_name) this._observers[event_name] = [];
      else this._observers = {}
    };
    object.observeOnce = function observeOnce(event_name, outer_observer, context) {
      outer_observer = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(outer_observer, arguments, 2);
      var inner_observer = ActiveSupport.Function.bind(function bound_inner_observer() {
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
      var args = ActiveSupport.Array.from(arguments).slice(1);
      for (var i = 0; i < this._observers[event_name].length; ++i) {
        var response = this._observers[event_name][i].apply(this._observers[event_name][i], args);
        if (response === false) return false;
        else collected_return_values.push(response)
      }
      return collected_return_values
    };
    if (object.prototype) {
      object.prototype._objectEventSetup = object._objectEventSetup;
      object.prototype.observe = object.observe;
      object.prototype.stopObserving = object.stopObserving;
      object.prototype.observeOnce = object.observeOnce;
      object.prototype.notify = function notify_instance(event_name) {
        if ((!object._observers || !object._observers[event_name] || object._observers[event_name] && object._observers[event_name].length == 0) && (!this.options || !this.options[event_name]) && (!this._observers || !this._observers[event_name] || this._observers[event_name] && this._observers[event_name].length == 0)) return [];
        var args = ActiveSupport.Array.from(arguments).slice(1);
        var collected_return_values = [];
        if (object.notify) {
          object_args = ActiveSupport.Array.from(arguments).slice(1);
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
  var ObservableHash = function ObservableHash(object) {
      this._object = object || {}
      };
  ObservableHash.prototype.set = function set(key, value, suppress_observers) {
    var old_value = this._object[key];
    this._object[key] = value;
    if (this._observers && this._observers.set && !suppress_observers) this.notify("set", key, value);
    return value
  };
  ObservableHash.prototype.get = function get(key) {
    return this._object[key]
  };
  ObservableHash.prototype.unset = function unset(key) {
    if (this._observers && this._observers.unset) this.notify("unset", key);
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
    /**
     * ActiveRecord.Models -> Object
     * Contains model_name, ActiveRecord.Class pairs.
     **/
    Models: {},
    /**
     * ActiveRecord.ClassMethods -> Object
     * Contains all methods that will become available to ActiveRecord classes.
     **/
    ClassMethods: {},
    /**
     * ActiveRecord.InstanceMethods -> Object
     * Contains all methods that will become available to ActiveRecord instances.
     **/
    InstanceMethods: {},
    /**
     * ActiveRecord.create(table_name[,fields][,instance_methods]) -> ActiveRecord.Model
     * ActiveRecord.create(options[,fields][,instance_methods]) -> ActiveRecord.Model
     * Creates an ActiveRecord class, returning the class and storing it inside
     * ActiveRecord.Models[model_name]. model_name is a singularized,
     * capitalized form of table name.
     *
     *     var User = ActiveRecord.create('users',{
     *         id: 0,
     *         name: ''
     *     });
     *     var u = User.find(5);
     *
     * The fields hash should consist of column name, default value pairs. If an empty
     * array or empty object is set as the default, any arbitrary data
     * can be set and will automatically be serialized when saved. To
     * specify a specific type, set the value to an object that contains
     * a "type" key, with optional "length" and "value" keys.
     **/
    create: function create(options, fields, methods) {
      if (typeof (options) === 'string') {
        options = {
          tableName: options
        };
      }

      //determine proper model name
      var model = null;
      if (!options.modelName) {
        var model_name = ActiveSupport.String.camelize(ActiveSupport.String.singularize(options.tableName) || options.tableName);
        options.modelName = model_name.charAt(0).toUpperCase() + model_name.substring(1);
      }

      //constructor
      model = ActiveRecord.Models[options.modelName] = function initialize(data) {
        if (!ActiveRecord.connection) {
          throw ActiveRecord.Errors.ConnectionNotEstablished.getErrorString();
        }

        this._object = {};
        for (var key in data) {
          //third param is to suppress notifications on set
          this.set(key, data[key], true);
        }
        this._errors = [];
        var fields = this.constructor.fields;
        for (var key in fields) {
          var field = fields[key];
          if (!field.primaryKey) {
            var value = ActiveRecord.connection.fieldOut(key, field, this.get(key));
            if (Adapters.objectIsFieldDefinition(value)) {
              value = value.value;
            }
            //don't supress notifications on set since these are the processed values
            this.set(key, value);
          }
        }
        this._id = this.get(this.constructor.primaryKeyName);
        //performance optimization if no observers
        this.notify('afterInitialize', data);
      };
      /**
       * ActiveRecord.Model.modelName -> String
       **/
      model.modelName = options.modelName;
      /**
       * ActiveRecord.Model.tableName -> String
       **/
      model.tableName = options.tableName;
      /**
       * ActiveRecord.Model.primaryKeyName -> String
       **/
      model.primaryKeyName = 'id';

      //mixin instance methods
      ActiveSupport.Object.extend(model.prototype, ActiveRecord.InstanceMethods);

      //user defined methods take precedence
      if (typeof (methods) == 'undefined') {
        //detect if the fields object is actually a methods object
        for (var method_name in fields) {
          if (typeof (fields[method_name]) == 'function') {
            methods = fields;
            fields = null;
          }
          break;
        }
      }
      if (methods && typeof (methods) !== 'function') {
        ActiveSupport.Object.extend(model.prototype, methods);
      }

      //mixin class methods
      ActiveSupport.Object.extend(model, ActiveRecord.ClassMethods);

      //add lifecycle abilities
      ActiveEvent.extend(model);

      //clean and set field definition
      if (!fields) {
        fields = {};
      }
      var custom_primary_key = false;
      for (var field_name in fields) {
        if (typeof (fields[field_name]) === 'object' && fields[field_name].type && !('value' in fields[field_name])) {
          fields[field_name].value = null;
        }
        if (typeof (fields[field_name]) === 'object' && fields[field_name].primaryKey) {
          custom_primary_key = field_name;
        }
      }
      if (!custom_primary_key) {
        fields['id'] = {
          primaryKey: true
        };
      }
      model.fields = fields;
      if (custom_primary_key) {
        model.primaryKeyName = custom_primary_key;
      }

      ActiveSupport.Object.extend(model.prototype, {
        modelName: model.modelName,
        tableName: model.tableName,
        primaryKeyName: model.primaryKeyName
      });

      //generate finders
      for (var key in model.fields) {
        Finders.generateFindByField(model, key);
        Finders.generateFindAllByField(model, key);
      }

      //setup relationship meta data container
      model.relationships = [];

      if (ActiveRecord.autoMigrate) {
        //TODO: Implement Schema.createTable
        //Migrations.Schema.createTable(options.tableName, ActiveSupport.clone(model.fields))
      }

      return model;
    }
  };

  /**
   * class ActiveRecord.Model
   * includes Observable
   * All classes created with [[ActiveRecord.create]] will contain these class and instance methods.
   * Models may also contain dynamically generated finder and relationship methods that are not
   * listed in the API documentation.
   **/
  ActiveEvent.extend(ActiveRecord);

  ActiveRecord.eventNames = ['afterInitialize', 'afterFind', 'beforeSave', 'afterSave', 'beforeCreate', 'afterCreate', 'beforeDestroy', 'afterDestroy'];

  //add lifecycle method names to classes and models (model_instance.beforeDestory() model_class.beforeDestroy())
  (function () {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) {
      ActiveRecord.ClassMethods[ActiveRecord.eventNames[i]] = ActiveRecord.InstanceMethods[ActiveRecord.eventNames[i]] = ActiveSupport.Function.curry(function event_name_delegator(event_name, observer) {
        return this.observe(event_name, observer);
      }, ActiveRecord.eventNames[i]);
    }
  })();

  /**
   * ActiveRecord.observe(event_name,callback) -> Array
   * Observe an event on all models. observer will be called with model_class, model_instance.
   *
   *     ActiveRecord.observe('afterDestroy',function(model,instance){});
   **/
  ActiveRecord.old_observe = ActiveRecord.observe;
  ActiveRecord.observe = function observe(event_name, observer) {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) {
      if (ActiveRecord.eventNames[i] === event_name) {
        var observers = [];
        var model_observer;
        for (var model_name in ActiveRecord.Models) {
          model_observer = ActiveSupport.Function.curry(observer, ActiveRecord.Models[model_name]);
          observers.push(model_observer);
          ActiveRecord.Models[model_name].observe(event_name, model_observer);
        }
        return observers;
      }
    }
    return ActiveRecord.old_observe(event_name, observer);
  };

  //add lifecycle method names to ActiveRecord (ActiveRecord.beforeDestory)
  (function () {
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i) {
      ActiveRecord[ActiveRecord.eventNames[i]] = ActiveSupport.Function.curry(function event_name_delegator(event_name, observer) {
        ActiveRecord.observe(event_name, observer);
      }, ActiveRecord.eventNames[i]);
    }
  })();
  var Errors = {
    ConnectionNotEstablished: ActiveSupport.createError('No ActiveRecord connection is active.'),
    MethodDoesNotExist: ActiveSupport.createError('The requested method does not exist. %'),
    InvalidFieldType: ActiveSupport.createError('The field type does not exist: %')
  };

  ActiveRecord.Errors = Errors;
  ActiveSupport.Object.extend(ActiveRecord.InstanceMethods, {
    /**
     * ActiveRecord.Model#set(key,value[,suppress_notifications = false]) -> null
     * Sets a given key on the object. You must use this method to set a property, properties assigned directly (instance.key_name = value) will not persist to the database and may cause errors.
     **/
    set: function set(key, value, suppress_notifications) {
      if (typeof (this[key]) !== "function") {
        this[key] = value;
      }
      this._object[key] = value;
      if (!suppress_notifications) {
        if (this._observers && ('set' in this._observers)) {
          this.notify('set', key, value);
        }
      }
    },
    /**
     * ActiveRecord.Model#get(key) -> mixed
     * Get a given key on the object. If your field name is a reserved word, or the name of a method (save, updateAttribute, etc) you must use the get() method to access the property. For convenience non reserved words (title, user_id, etc) can be accessed directly (instance.key_name)
     **/
    get: function get(key) {
      return this._object[key];
    },
    /**
     * ActiveRecord.Model#toObject([transform_callback]) -> Object
     * Returns a vanilla version of the object, with just the data and no methods.
     * - transform_callback (Function) Will recieve and should reutrn a hash of attributes.
     **/
    toObject: function toObject(callback) {
      var response = ActiveSupport.Object.clone(this._object);
      if (callback) {
        response = callback(response);
      }
      return response;
    },
    /**
     * ActiveRecord.Model#keys() -> Array
     * Returns an array of the column names that the instance contains.
     **/
    keys: function keys() {
      var keys_array = [];
      for (var key_name in this._object) {
        keys_array.push(key_name);
      }
      return keys_array;
    },
    /**
     * ActiveRecord.Model#values() -> Array
     * Returns an array of the column values that the instance contains.
     **/
    values: function values() {
      var values_array = [];
      for (var key_name in this._object) {
        values_array.push(this._object[key_name]);
      }
      return values_array;
    },
    /**
     * ActiveRecord.Model#updateAttribute(key,value) -> Boolean
     * Sets a given key on the object and immediately persists that change to the database triggering any callbacks or validation .
     **/
    updateAttribute: function updateAttribute(key, value) {
      this.set(key, value);
      return this.save();
    },
    /**
     * ActiveRecord.Model#updateAttributes(attributes) -> Boolean
     * Updates all of the passed attributes on the record and then calls save().
     **/
    updateAttributes: function updateAttributes(attributes) {
      for (var key in attributes) {
        this.set(key, attributes[key]);
      }
      return this.save();
    },
    /**
     * ActiveRecord.Model#reload() -> Boolean
     * Loads the most current data for the object from the database.
     **/
    reload: function reload() {
      if (this._id === undefined) {
        return false;
      }
      var record = this.constructor.find(this._id);
      if (!record) {
        return false;
      }
      this._object = {};
      var raw = record.toObject();
      for (var key in raw) {
        this.set(key, raw[key]);
      }
      return true;
    },
    /**
     * ActiveRecord.Model#save([force_created_mode = false]) -> Boolean
     * - force_created_mode (Boolean): Defaults to false, will force the record to act as if it was created even if an id property was passed.
     * Persists the object, creating or updating as nessecary.
     **/
    save: function save(force_created_mode) {
      this._validate();
      if (!this.isValid()) {
        return false;
      }
      //apply field in conversions
      for (var key in this.constructor.fields) {
        if (!this.constructor.fields[key].primaryKey) {
          //third param is to suppress observers
          this.set(key, ActiveRecord.connection.fieldIn(key, this.constructor.fields[key], this.get(key)), true);
        }
      }
      if (this.notify('beforeSave') === false) {
        return false;
      }
      if ('updated' in this._object) {
        this.set('updated', ActiveSupport.dateFormat('yyyy-mm-dd HH:MM:ss'));
      }
      if (force_created_mode || this._id === undefined) {
        if (this.notify('beforeCreate') === false) {
          return false;
        }
        if ('created' in this._object) {
          this.set('created', ActiveSupport.dateFormat('yyyy-mm-dd HH:MM:ss'));
        }
        ActiveRecord.connection.insertEntity(this.tableName, this.constructor.primaryKeyName, this.toObject());
        if (!this.get(this.constructor.primaryKeyName)) {
          this.set(this.constructor.primaryKeyName, ActiveRecord.connection.getLastInsertedRowId());
        }
        this.notify('afterCreate');
      } else {
        if (this.notify('beforeUpdate') === false) {
          return false;
        }
        ActiveRecord.connection.updateEntity(this.tableName, this.constructor.primaryKeyName, this._id, this.toObject());
        //afterUpdate is not a synchronization event, afterSave covers all cases
        this.notify('afterUpdate');
      }
      //apply field out conversions
      for (var key in this.constructor.fields) {
        if (!this.constructor.fields[key].primaryKey) {
          //third param is to suppress observers
          this.set(key, ActiveRecord.connection.fieldOut(key, this.constructor.fields[key], this.get(key)), true);
        }
      }
      this._id = this.get(this.constructor.primaryKeyName);
      this.notify('afterSave');
      return this;
    },
    /**
     * ActiveRecord.Model#destroy() -> Boolean
     * Removes the object from the database, but does not destroy the object in memory itself.
     **/
    destroy: function destroy() {
      if (this._id === undefined) {
        return false;
      }
      if (this.notify('beforeDestroy') === false) {
        return false;
      }
      var response = ActiveRecord.connection.deleteEntity(this.tableName, this.constructor.primaryKeyName, this._id);
      if (this.notify('afterDestroy') === false) {
        return false;
      }
      return true;
    },
    /**
     * ActiveRecord.Model#toSerializableObject([transform_callback]) -> Object
     * toJSON will call this instead of toObject() to get the
     * data they will serialize. By default this calls toObject(), but
     * you can override this method to easily create custom JSON output.
     * - transform_callback (Function): Will recieve and should reutrn a hash of attributes.
     **/
    toSerializableObject: function toSerializableObject(callback) {
      return this.toObject(callback);
    },
    /**
     * ActiveRecord.Model#toJSON([object_to_inject]) -> String
     * Serializes the record to an JSON string. If object_to_inject is passed
     * that object will override any values of the record.
     **/
    toJSON: function toJSON(object_to_inject) {
      return ActiveSupport.Object.extend(this.toSerializableObject(), object_to_inject || {});
    }
  });
  ActiveSupport.Object.extend(ActiveRecord.ClassMethods, {
    /**
     * ActiveRecord.Model.find(id) -> Boolean | Object
     * ActiveRecord.Model.find(array_of_ids) -> Array
     * ActiveRecord.Model.find(params) -> Array
     * ActiveRecord.Model.find(sql_statement) -> Array
     *
     * Find a given record, or multiple records matching the passed conditions. Params may contain:
     *
     * - select (Array) of columns to select, default ['*']
     * - where (String | Object | Array)
     * - joins (String)
     * - order (String)
     * - limit (Number)
     * - offset (Number)
     * - callback (Function)
     *
     *     //finding single records
     *     var user = User.find(5);
     *     var user = User.find({
     *         first: true,
     *         where: {
     *             id: 5
     *         }
     *     });
     *     var user = User.find({
     *         first: true,
     *         where: ['id = ?',5]
     *     });
     *
     *     //finding multiple records
     *     var users = User.find(); //finds all
     *     var users = User.find(1,2,3); //finds ids 1,2,3
     *     var users = User.find([1,2,3]); // finds ids 1,2,3
     *
     *     //finding multiple records with complex where statements
     *     var users = User.find({
     *         where: 'name = "alice" AND password = "' + md5('pass') + '"',
     *         order: 'id DESC'
     *     });
     *
     *     var users = User.find({
     *         where: ['name = ? AND password = ?','alice',md5('pass')],
     *         order: 'id DESC'
     *     });
     *
     *     //using the where syntax below, the parameters will be properly escaped
     *     var users = User.find({
     *         where: {
     *             name: 'alice',
     *             password: md5('pass')
     *         }
     *         order: 'id DESC'
     *     });
     *
     *     //find using a complete SQL statement
     *     var users = User.find('SELECT * FROM users ORDER id DESC');
     *
     *     //find using a callback, "user" in this case only contains a hash
     *     //of the user attributes, it is not an ActiveRecord instance
     *     var users = User.find({
     *         callback: function(user){
     *              return user.name.toLowerCase() == 'a';
     *         }
     *     });
     **/
    find: function find(params) {
      if (!ActiveRecord.connection) {
        throw ActiveRecord.Errors.ConnectionNotEstablished.getErrorString();
      }
      if (params === 0) {
        return false;
      }
      var result;
      if (!params) {
        params = {};
      }
      if ((params.first && typeof params.first === "boolean") || ((typeof (params) === "number" || (typeof (params) === "string" && params.match(/^\d+$/))) && arguments.length == 1)) {
        if (params.first) {
          //find first
          params.limit = 1;
          result = ActiveRecord.connection.findEntities(this.tableName, params);
        } else {
          //single id
          var data = ActiveRecord.connection.findEntityById(this.tableName, this.primaryKeyName, params);
          if (data) {
            return this.build(data);
          } else {
            return false;
          }

        }
        if (result && result.iterate && result.iterate(0)) {
          return this.build(result.iterate(0));
        } else {
          return false;
        }
      } else {
        result = null;
        if (typeof (params) === 'string' && !params.match(/^\d+$/)) {
          //find by sql
          result = ActiveRecord.connection.findEntities.apply(ActiveRecord.connection, arguments);
        } else if (params && ((typeof (params) == 'object' && 'length' in params && 'slice' in params) || ((typeof (params) == 'number' || typeof (params) == 'string') && arguments.length > 1))) {
          //find by multiple ids
          var ids = ((typeof (params) == 'number' || typeof (params) == 'string') && arguments.length > 1) ? ActiveSupport.Array.from(arguments) : params;
          result = ActiveRecord.connection.findEntitiesById(this.tableName, this.primaryKeyName, ids);
        } else {
          //result find
          result = ActiveRecord.connection.findEntities(this.tableName, params);
        }
        var response = [];
        if (result) {
          result.iterate(function result_iterator(row) {
            response.push(this.build(row));
          }, this);
        }
        this.resultSetFromArray(response, params);
        this.notify('afterFind', response, params);
        return response;
      }
    },
    /**
     * ActiveRecord.Model.destroy(id) -> Boolean | String
     * Deletes a given id (if it exists) calling any callbacks or validations
     * on the record. If "all" is passed as the ids, all records will be found
     * and destroyed.
     **/
    destroy: function destroy(id) {
      if (id == 'all') {
        var instances = this.find({
          all: true
        });
        var responses = [];
        for (var i = 0; i < instances.length; ++i) {
          responses.push(instances[i].destroy());
        }
        return responses;
      } else if (ActiveSupport.Object.isArray(id)) {
        var responses = [];
        for (var i = 0; i < id.length; ++i) {
          var instance = this.find(id[i]);
          if (!instance) {
            responses.push(false);
          } else {
            responses.push(instance.destroy());
          }
        }
        return responses;
      } else {
        var instance = this.find(id);
        if (!instance) {
          return false;
        }
        return instance.destroy();
      }
    },
    /**
     * ActiveRecord.Model.build(attributes) -> Object
     * Identical to calling create(), but does not save the record.
     **/
    build: function build(data) {
      if (ActiveSupport.Object.isArray(data)) {
        var records = [];
        for (var i = 0; i < data.length; ++i) {
          var record = new this(ActiveSupport.Object.clone(data[i]));
          records.push(record);
        }
        return records;
      } else {
        return new this(ActiveSupport.Object.clone(data));
      }
    },
    /**
     * ActiveRecord.Model.create(attributes) -> Object
     *
     *     var u = User.create({
     *         name: 'alice',
     *         password: 'pass'
     *     });
     *     u.id //will now contain the id of the user
     **/
    create: function create(data) {
      if (ActiveSupport.Object.isArray(data)) {
        var records = [];
        for (var i = 0; i < data.length; ++i) {
          var record = this.build(data[i]);
          record.save(true);
          records.push(record);
        }
        return records;
      } else {
        var record = this.build(data);
        record.save(true);
        return record;
      }
    },
    /**
     * ActiveRecord.Model.update(id,attributes) -> Object
     *
     *     Article.update(3,{
     *         title: 'New Title'
     *     });
     *     //or pass an array of ids and an array of attributes
     *     Article.update([5,7],[
     *         {title: 'Title for 5'},
     *         {title: 'Title for 7'}
     *     ]);
     *     //or pass an array of ids and a hash of attributes
     *     Article.update([5,7],{
     *         featured: false
     *     });
     **/
    update: function update(id, attributes) {
      if (ActiveSupport.Object.isArray(id)) {
        var attributes_is_array = ActiveSupport.Object.isArray(attributes);
        var results = [];
        for (var i = 0; i < id.length; ++i) {
          var record = this.find(id[i]);
          if (!record) {
            results.push(false);
          } else {
            results.push(record.updateAttributes(attributes_is_array ? attributes[i] : attributes));
          }
        }
        return results;
      } else {
        var record = this.find(id);
        if (!record) {
          return false;
        }
        record.updateAttributes(attributes);
        return record;
      }
    },
    /**
     * ActiveRecord.Model.updateAll(updates[,conditions]) -> null
     * - updates (Object | String) A string of updates to make, or a Hash of column value pairs.
     * - conditions (String): Optional where condition, or Hash of column name, value pairs.
     **/
    updateAll: function updateAll(updates, conditions) {
      ActiveRecord.connection.updateMultitpleEntities(this.tableName, updates, conditions);
    },
    /**
     * ActiveRecord.Model.resultSetFromArray(result_set[,find_params]) -> Array
     * Extends a vanilla array with ActiveRecord.ResultSet methods allowing for
     * the construction of custom result set objects from arrays where result
     * sets are expected. This will modify the array that is passed in and
     * return the same array object.
     *
     *     var one = Comment.find(1);
     *     var two = Comment.find(2);
     *     var result_set = Comment.resultSetFromArray([one,two]);
     **/
    resultSetFromArray: function resultSetFromArray(result_set, params) {
      if (!params) {
        params = {};
      }
      for (var method_name in ResultSet.InstanceMethods) {
        result_set[method_name] = ActiveSupport.Function.curry(ResultSet.InstanceMethods[method_name], result_set, params, this);
      }
      return result_set;
    }
  });
  ActiveSupport.Object.extend(ActiveRecord.ClassMethods, {
    processCalculationParams: function processCalculationParams(operation, params) {
      if (!params) {
        params = {};
      }
      if (typeof (params) === 'string') {
        params = {
          where: params
        };
      }
      return params;
    },
    performCalculation: function performCalculation(operation, params, sql_fragment) {
      return ActiveRecord.connection.calculateEntities(this.tableName, this.processCalculationParams(operation, params), sql_fragment);
    },
    /**
     * ActiveRecord.Model.count([options]) -> Number
     * options can contain all params that `find` can
     **/
    count: function count(params) {
      return this.performCalculation('count', params, 'COUNT(*)');
    },
    /**
     * ActiveRecord.Model.average(column_name[,options]) -> Number
     * options can contain all params that `find` can
     **/
    average: function average(column_name, params) {
      return this.performCalculation('average', params, 'AVG(' + column_name + ')');
    },
    /**
     * ActiveRecord.Model.max(column_name[,options]) -> Number
     * options can contain all params that `find` can
     **/
    max: function max(column_name, params) {
      return this.performCalculation('max', params, 'MAX(' + column_name + ')');
    },
    /**
     * ActiveRecord.Model.min(column_name[,options]) -> Number
     * options can contain all params that `find` can
     **/
    min: function min(column_name, params) {
      return this.performCalculation('min', params, 'MIN(' + column_name + ')');
    },
    /**
     * ActiveRecord.Model.sum(column_name[,options]) -> Number
     * options can contain all params that `find` can
     **/
    sum: function sum(column_name, params) {
      return this.performCalculation('sum', params, 'SUM(' + column_name + ')');
    },
    /**
     * ActiveRecord.Model.first() -> Object
     * Returns the first record sorted by id.
     **/
    first: function first() {
      return this.find({
        first: true
      });
    },
    /**
     * ActiveRecord.Model.last() -> Object
     * Returns the last record sorted by id.
     **/
    last: function last() {
      return this.find({
        first: true,
        order: this.primaryKeyName + ' DESC'
      });
    }
  });
  /**
   * ActiveRecord.Adapters
   **/
  var Adapters = {};

  /**
   * ActiveRecord.connection
   * null if no connection is active, or the connection object.
   **/
  ActiveRecord.connection = null;

  /**
   * ActiveRecord.connect() -> null
   * ActiveRecord.connect(url) -> null
   * ActiveRecord.connection(json) -> null
   * - url (String): Location to load JSON data from.
   * - json (String | Object): JSON string or JSON object.
   *
   *     //empty in memory database
   *     ActiveRecord.connect();
   *     //in memory database populated with json data
   *     ActiveRecord.connect('{my_table:{1:{field:"value"}}}');
   *     //in memory database populated with json data loaded from remote source
   *     ActiveRecord.connect('my_data_source.json');
   **/
  ActiveRecord.connect = function connect(adapter) {
    if (!adapter) {
      ActiveRecord.connection = ActiveRecord.Adapters.InMemory.connect();
    } else {
      ActiveRecord.adapter = adapter;
      ActiveRecord.connection = adapter.connect.apply(adapter, Array.prototype.slice.call(arguments, 1))
    }
    ActiveRecord.notify('ready');
  };

  /**
   * ActiveRecord.execute(sql_statement) -> Array
   * Accepts a variable number of arguments.
   *
   * Execute a SQL statement on the active connection. If the statement requires arguments they must be passed in after the SQL statement.
   *
   *     ActiveRecord.execute('DELETE FROM users WHERE user_id = ?',5);
   **/
  ActiveRecord.execute = function execute() {
    if (!ActiveRecord.connection) {
      throw ActiveRecord.Errors.ConnectionNotEstablished.getErrorString();
    }
    return ActiveRecord.connection.executeSQL.apply(ActiveRecord.connection, arguments);
  };

  /**
   * ActiveRecord.escape(value[,suppress_quotes = false]) -> Number | String
   * Escapes a given argument for use in a SQL string. By default
   * the argument passed will also be enclosed in quotes.
   *
   * ActiveRecord.escape(5) == 5
   * ActiveRecord.escape('tes"t') == '"tes\"t"';
   **/
  ActiveRecord.escape = function escape(argument, suppress_quotes) {
    var quote = suppress_quotes ? '' : '"';
    return typeof (argument) == 'number' ? argument : quote + String(argument).replace(/\"/g, '\\"').replace(/\\/g, '\\\\').replace(/\0/g, '\\0') + quote;
  };


  /**
   * ActiveRecord.transaction(callback,[error_callback]) -> null
   * - proceed (Function): The block of code to execute inside the transaction.
   * - error_callback (Function): Optional error handler that will be called with an exception if one is thrown during a transaction. If no error handler is passed the exception will be thrown.
   *
   *     ActiveRecord.transaction(function(){
   *         var from = Account.find(2);
   *         var to = Account.find(3);
   *         to.despoit(from.withdraw(100.00));
   *     });
   **/
  ActiveRecord.transaction = function transaction(proceed, error) {
    try {
      ActiveRecord.connection.transaction(proceed);
    } catch (e) {
      if (error) {
        error(e);
      } else {
        throw e;
      }
    }
  };

  //deprecated
  ActiveRecord.ClassMethods.transaction = ActiveRecord.transaction;

  Adapters.defaultResultSetIterator = function defaultResultSetIterator(iterator) {
    if (typeof (iterator) === 'number') {
      if (this.rows[iterator]) {
        return ActiveSupport.Object.clone(this.rows[iterator]);
      } else {
        return false;
      }
    } else {
      for (var i = 0; i < this.rows.length; ++i) {
        var row = ActiveSupport.Object.clone(this.rows[i]);
        iterator(row);
      }
    }
  };

  Adapters.objectIsFieldDefinition = function objectIsFieldDefinition(object) {
    return typeof (object) === 'object' && ActiveSupport.Object.keys(object).length === 2 && ('type' in object) && ('value' in object);
  };

  Adapters.fieldTypesWithDefaultValues = {
    'tinyint': 0,
    'smallint': 0,
    'mediumint': 0,
    'int': 0,
    'integer': 0,
    'bigint': 0,
    'float': 0,
    'double': 0,
    'double precision': 0,
    'real': 0,
    'decimal': 0,
    'numeric': 0,

    'date': '',
    'datetime': '',
    'timestamp': '',
    'time': '',
    'year': '',

    'char': '',
    'varchar': '',
    'tinyblob': '',
    'tinytext': '',
    'blob': '',
    'text': '',
    'mediumtext': '',
    'mediumblob': '',
    'longblob': '',
    'longtext': '',

    'enum': '',
    'set': ''
  };


  Adapters.InstanceMethods = {
    setValueFromFieldIfValueIsNull: function setValueFromFieldIfValueIsNull(field, value) {
      //no value was passed
      if (value === null || typeof (value) === 'undefined') {
        //default value was in field specification
        if (Adapters.objectIsFieldDefinition(field)) {
          var default_value = this.getDefaultValueFromFieldDefinition(field);
          if (typeof (default_value) === 'undefined') {
            throw Errors.InvalidFieldType.getErrorString(field ? (field.type || '[object]') : 'false');
          }
          return field.value || default_value;
        }
        //default value was set, but was not field specification
        else {
          return field;
        }
      }
      return value;
    },
    getColumnDefinitionFragmentFromKeyAndColumns: function getColumnDefinitionFragmentFromKeyAndColumns(key, columns) {
      return this.quoteIdentifier(key) + ((typeof (columns[key]) === 'object' && typeof (columns[key].type) !== 'undefined') ? columns[key].type : this.getDefaultColumnDefinitionFragmentFromValue(columns[key]));
    },
    getDefaultColumnDefinitionFragmentFromValue: function getDefaultColumnDefinitionFragmentFromValue(value) {
      if (typeof (value) === 'string') {
        return 'VARCHAR(255)';
      }
      if (typeof (value) === 'number') {
        return 'INT';
      }
      if (typeof (value) == 'boolean') {
        return 'TINYINT(1)';
      }
      return 'TEXT';
    },
    getDefaultValueFromFieldDefinition: function getDefaultValueFromFieldDefinition(field) {
      return field.value ? field.value : Adapters.fieldTypesWithDefaultValues[field.type ? field.type.replace(/\(.*/g, '').toLowerCase() : ''];
    },
    quoteIdentifier: function quoteIdentifier(name) {
      return '"' + name + '"';
    }
  };

  ActiveRecord.Adapters = Adapters;
  Adapters.SQL = {
    schemaLess: false,
    insertEntity: function insertEntity(table, primary_key_name, data) {
      var keys = ActiveSupport.Object.keys(data).sort();
      var values = [];
      var args = [];
      var quoted_keys = [];
      for (var i = 0; i < keys.length; ++i) {
        args.push(data[keys[i]]);
        values.push('?');
        quoted_keys.push(this.quoteIdentifier(keys[i]));
      }
      args.unshift("INSERT INTO " + table + " (" + quoted_keys.join(',') + ") VALUES (" + values.join(',') + ")");
      var response = this.executeSQL.apply(this, args);
      var id = data[primary_key_name] || this.getLastInsertedRowId();
      var data_with_id = ActiveSupport.clone(data);
      data_with_id[primary_key_name] = id;
      this.notify('created', table, id, data_with_id);
      return response;
    },
    updateMultitpleEntities: function updateMultitpleEntities(table, updates, conditions) {
      var args = [];
      if (typeof (updates) !== 'string') {
        var values = [];
        var keys = ActiveSupport.Object.keys(updates).sort();
        for (var i = 0; i < keys.length; ++i) {
          args.push(updates[keys[i]]);
          values.push(this.quoteIdentifier(keys[i]) + " = ?");
        }
        updates = values.join(',');
      }
      args.unshift('UPDATE ' + table + ' SET ' + updates + this.buildWhereSQLFragment(conditions, args));
      return this.executeSQL.apply(this, args);
    },
    updateEntity: function updateEntity(table, primary_key_name, id, data) {
      var keys = ActiveSupport.Object.keys(data).sort();
      var args = [];
      var values = [];
      for (var i = 0; i < keys.length; ++i) {
        args.push(data[keys[i]]);
        values.push(this.quoteIdentifier(keys[i]) + " = ?");
      }
      args.push(id);
      args.unshift("UPDATE " + table + " SET " + values.join(',') + " WHERE " + this.quoteIdentifier(primary_key_name) + " = ?");
      var response = this.executeSQL.apply(this, args);
      this.notify('updated', table, id, data);
      return response;
    },
    calculateEntities: function calculateEntities(table, params, operation) {
      var process_count_query_result = function process_count_query_result(response) {
          if (!response) {
            return 0;
          }
          return parseInt(ActiveRecord.connection.iterableFromResultSet(response).iterate(0)['calculation'], 10);
          };
      var args = this.buildSQLArguments(table, params, operation);
      return process_count_query_result(this.executeSQL.apply(this, args));
    },
    deleteEntity: function deleteEntity(table, primary_key_name, id) {
      var args, response;
      if (id === 'all') {
        args = ["DELETE FROM " + table];
        var ids = [];
        var ids_result_set = this.executeSQL('SELECT ' + this.quoteIdentifier(primary_key_name) + ' FROM ' + table);
        if (!ids_result_set) {
          return null;
        }
        this.iterableFromResultSet(ids_result_set).iterate(function id_collector_iterator(row) {
          ids.push(row[primary_key_name]);
        });
        response = this.executeSQL.apply(this, args);
        for (var i = 0; i < ids.length; ++i) {
          this.notify('destroyed', table, ids[i]);
        }
        return response;
      } else {
        args = ["DELETE FROM " + table + " WHERE " + this.quoteIdentifier(primary_key_name) + " = ?", id];
        response = this.executeSQL.apply(this, args);
        this.notify('destroyed', table, id);
        return response;
      }
    },
    findEntitiesById: function findEntityById(table, primary_key_name, ids) {
      var response = this.executeSQL.apply(this, ['SELECT * FROM ' + table + ' WHERE ' + this.quoteIdentifier(primary_key_name) + ' IN (' + ids.join(',') + ')']);
      if (!response) {
        return false;
      } else {
        return ActiveRecord.connection.iterableFromResultSet(response);
      }
    },
    findEntities: function findEntities(table, params) {
      var args;
      if (typeof (table) === 'string' && !table.match(/^\d+$/) && typeof (params) != 'object') {
        args = arguments;
      } else {
        args = this.buildSQLArguments(table, params, false);
      }
      var response = this.executeSQL.apply(this, args);
      if (!response) {
        return false;
      } else {
        var iterable_response = ActiveRecord.connection.iterableFromResultSet(response);
        if (params.callback) {
          var filtered_response = [];
          iterable_response.iterate(function (row) {
            if (params.callback(row)) {
              filtered_response.push(row);
            }
          });
          return filtered_response;
        } else {
          return iterable_response;
        }
      }
    },
    buildSQLArguments: function buildSQLArguments(table, params, calculation) {
      var args = [];
      var sql = 'SELECT ' + (calculation ? (calculation + ' AS calculation') : (params.select ? params.select.join(',') : '*')) + ' FROM ' + table + this.buildWhereSQLFragment(params.where, args) + (params.joins ? ' ' + params.joins : '') + (params.group ? ' GROUP BY ' + params.group : '') + (params.order ? ' ORDER BY ' + params.order : '') + (params.offset && params.limit ? ' LIMIT ' + params.offset + ',' + params.limit : '') + (!params.offset && params.limit ? ' LIMIT ' + params.limit : '');
      args.unshift(sql);
      return args;
    },
    buildWhereSQLFragment: function buildWhereSQLFragment(fragment, args) {
      var where, keys, i;
      if (fragment && ActiveSupport.isArray(fragment)) {
        for (i = 1; i < fragment.length; ++i) {
          args.push(fragment[i]);
        }
        return ' WHERE ' + fragment[0];
      } else if (fragment && typeof (fragment) !== "string") {
        where = '';
        keys = ActiveSupport.Object.keys(fragment);
        for (i = 0; i < keys.length; ++i) {
          where += this.quoteIdentifier(keys[i]) + " = ? AND ";
          var value;
          if (typeof (fragment[keys[i]]) === 'number') {
            value = fragment[keys[i]];
          } else if (typeof (fragment[keys[i]]) == 'boolean') {
            value = parseInt(Number(fragment[keys[i]]), 10);
          } else {
            value = String(fragment[keys[i]]);
          }
          args.push(value);
        }
        where = ' WHERE ' + where.substring(0, where.length - 4);
      } else if (fragment) {
        where = ' WHERE ' + fragment;
      } else {
        where = '';
      }
      return where;
    },
    //schema
    dropTable: function dropTable(table_name) {
      return this.executeSQL('DROP TABLE IF EXISTS ' + table_name);
    },
    addIndex: function addIndex(table_name, column_names, options) {

    },
    renameTable: function renameTable(old_table_name, new_table_name) {
      this.executeSQL('ALTER TABLE ' + old_table_name + ' RENAME TO ' + new_table_name);
    },
    removeIndex: function removeIndex(table_name, index_name) {

    },
    addColumn: function addColumn(table_name, column_name, data_type) {
      return this.executeSQL('ALTER TABLE ' + table_name + ' ADD COLUMN ' + this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns));
    },
    fieldIn: function fieldIn(field, value) {
      if (value && value instanceof Date) {
        return ActiveSupport.dateFormat(value, 'yyyy-mm-dd HH:MM:ss');
      }
      if (Adapters.objectIsFieldDefinition(field)) {
        field = this.getDefaultValueFromFieldDefinition(field);
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      if (typeof (field) === 'string') {
        return String(value);
      }
      if (typeof (field) === 'number') {
        return String(value);
      }
      if (typeof (field) === 'boolean') {
        return String(parseInt(Number(value), 10));
      }
      //array or object
      if (typeof (value) === 'object' && !Adapters.objectIsFieldDefinition(field)) {
        return ActiveSupport.JSON.stringify(value);
      }
    },
    fieldOut: function fieldOut(field, value) {
      if (Adapters.objectIsFieldDefinition(field)) {
        //date handling
        if (typeof (value) == 'string' && /date/.test(field.type.toLowerCase())) {
          return ActiveSupport.dateFromDateTime(value);
        }
        field = this.getDefaultValueFromFieldDefinition(field);
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      if (typeof (field) === 'string') {
        return value;
      }
      if (typeof (field) === 'boolean') {
        if (value === '0' || value === 0 || value === 'false') {
          value = false;
        }
        return !!value;
      }
      if (typeof (field) === 'number') {
        if (typeof (value) === 'number') {
          return value;
        };
        var t = ActiveSupport.trim(String(value));
        return (t.length > 0 && !(/[^0-9.]/).test(t) && (/\.\d/).test(t)) ? parseFloat(Number(value)) : parseInt(Number(value), 10);
      }
      //array or object (can come from DB (as string) or coding enviornment (object))
      if ((typeof (value) === 'string' || typeof (value) === 'object') && (typeof (field) === 'object' && (typeof (field.length) !== 'undefined' || typeof (field.type) === 'undefined'))) {
        if (typeof (value) === 'string') {
          return ActiveSupport.JSON.parse(value);
        } else {
          return value;
        }
      }
    },
    transaction: function transaction(proceed) {
      try {
        ActiveRecord.connection.executeSQL('BEGIN');
        proceed();
        ActiveRecord.connection.executeSQL('COMMIT');
      } catch (e) {
        ActiveRecord.connection.executeSQL('ROLLBACK');
        throw e;
      }
    }
  };
  Adapters.SQLite = ActiveSupport.Object.extend(ActiveSupport.Object.clone(Adapters.SQL), {
    createTable: function createTable(table_name, columns) {
      var keys = ActiveSupport.Object.keys(columns);
      var fragments = [];
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (columns[key].primaryKey) {
          var type = columns[key].type || 'INTEGER';
          fragments.unshift(this.quoteIdentifier(key) + ' ' + type + ' PRIMARY KEY');
        } else {
          fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns));
        }
      }
      return this.executeSQL('CREATE TABLE IF NOT EXISTS ' + table_name + ' (' + fragments.join(',') + ')');
    },
    dropColumn: function dropColumn(table_name, column_name) {
      this.transaction(ActiveSupport.bind(function drop_column_transaction() {
        var description = ActiveRecord.connection.iterableFromResultSet(ActiveRecord.connection.executeSQL('SELECT * FROM sqlite_master WHERE tbl_name = "' + table_name + '"')).iterate(0);
        var temp_table_name = 'temp_' + table_name;
        ActiveRecord.execute(description['sql'].replace(new RegExp('^CREATE\s+TABLE\s+' + table_name), 'CREATE TABLE ' + temp_table_name).replace(new RegExp('(,|\()\s*' + column_name + '[\s\w]+(\)|,)'), function () {
          return (args[1] == '(' ? '(' : '') + args[2];
        }));
        ActiveRecord.execute('INSERT INTO ' + temp_table_name + ' SELECT * FROM ' + table_name);
        this.dropTable(table_name);
        this.renameTable(temp_table_name, table_name);
      }, this));
    }
  });
  Adapters.InMemory = function InMemory(storage) {
    this.lastInsertId = null;
    this.setStorage(storage);
  };

  /**
   * ActiveRecord.connection.storage -> Object
   * Contains the raw data that the InMemory database uses. Stored in this format:
   *
   *     {
   *         table_name: {
   *             id: {
   *                 column_name: value
   *             }
   *         }
   *     }
   *
   *     ActiveRecord.connection.storage.table_name[id].column_name
   *     ActiveRecord.connection.storage.comments[5].title
   **/

  ActiveSupport.Object.extend(Adapters.InMemory.prototype, Adapters.InstanceMethods);

  ActiveSupport.Object.extend(Adapters.InMemory.prototype, {
    schemaLess: true,
    entityMissing: function entityMissing(id) {
      return {};
    },
    /**
     * ActiveRecord.connection.setStorage(storage) -> null
     * Sets the storage (in memory database hash) affter connect() has been called.
     *
     *     ActiveRecord.connect(ActiveRecord.Adapters.InMemory);
     *     ActiveRecord.connection.setStorage({my_table:{...}});
     **/
    setStorage: function setStorage(storage) {
      this.storage = typeof (storage) === 'string' ? ActiveSupport.JSON.parse(storage) : (storage || {});
      ActiveRecord.Indicies.initializeIndicies(this.storage);
    },
    /**
     * ActiveRecord.connection.serialize() -> String
     * Returns a JSON representation of the storage hash that the InMemory adapter
     * uses.
     **/
    serialize: function serialize() {
      return ActiveSupport.JSON.stringify(this.storage);
    },
    executeSQL: function executeSQL(sql) {
      if (ActiveRecord.logging) {
        ActiveSupport.log('Adapters.InMemory could not execute SQL:' + sql);
      }
    },
    insertEntity: function insertEntity(table, primary_key_name, data) {
      this.setupTable(table);
      var max = 1;
      var table_data = this.storage[table];
      if (!data.id) {
        for (var id in table_data) {
          if (parseInt(id, 10) >= max) {
            max = parseInt(id, 10) + 1;
          }
        }
        data.id = max;
      }
      this.lastInsertId = data.id;
      this.storage[table][data.id] = data;
      return true;
    },
    getLastInsertedRowId: function getLastInsertedRowId() {
      return this.lastInsertId;
    },
    updateMultitpleEntities: function updateMultitpleEntities(table, updates, conditions) {

    },
    updateEntity: function updateEntity(table, primary_key_name, id, data) {
      this.setupTable(table);
      if (data[primary_key_name] != id) {
        //edge case where id has changed
        this.storage[table][data[primary_key_name]] = data;
        delete this.storage[table][id];
      } else {
        this.storage[table][id] = data;
      }
      return true;
    },
    calculateEntities: function calculateEntities(table, params, operation) {
      this.setupTable(table);
      var entities = this.findEntities(table, params);
      var parsed_operation = operation.match(/([A-Za-z]+)\(([^\)]+)\)/);
      var operation_type = parsed_operation[1].toLowerCase();
      var column_name = parsed_operation[2];
      switch (operation_type) {
      case 'count':
        return entities.length;
      case 'max':
        var max = 0;
        for (var i = 0; i < entities.length; ++i) {
          if (parseInt(entities[i][column_name], 10) > max) {
            max = parseInt(entities[i][column_name], 10);
          }
        }
        return max;
      case 'min':
        var min = 0;
        if (entities[0]) {
          min = entities[0][column_name];
        }
        for (var i = 0; i < entities.length; ++i) {
          if (entities[i][column_name] < min) {
            min = entities[i][column_name];
          }
        }
        return min;
      case 'avg':
      case 'sum':
        var sum = 0;
        for (var i = 0; i < entities.length; ++i) {
          sum += entities[i][column_name];
        }
        return operation_type === 'avg' ? sum / entities.length : sum;
      }
    },
    deleteEntity: function deleteEntity(table, primary_key_name, id) {
      this.setupTable(table);
      if (!id || id === 'all') {
        this.storage[table] = {};
        return true;
      } else if (this.storage[table][id]) {
        delete this.storage[table][id];
        return true;
      }
      return false;
    },
    findEntityById: function findEntityById(table, primary_key_name, id) {
      return this.storage[table][id];
    },
    findEntitiesById: function findEntitiesById(table, primary_key_name, ids) {
      var table_data = this.storage[table];
      var response = [];
      for (var i = 0; i < ids.length; ++i) {
        var id = ids[i];
        if (table_data[id]) {
          response.push(table_data[id]);
        }
      }
      return this.iterableFromResultSet(response);
    },
    findEntities: function findEntities(table, params) {
      if (typeof (table) === 'string' && !table.match(/^\d+$/) && typeof (params) != 'object') {
        //find by SQL
        //replace ? in SQL strings
        var sql = table;
        var sql_args = ActiveSupport.Array.from(arguments).slice(1);
        for (var i = 0; i < sql_args.length; ++i) {
          sql = sql.replace(/\?/, ActiveRecord.escape(sql_args[i]));
        }
        var response = this.paramsFromSQLString(sql);
        table = response[0];
        params = response[1];
      } else if (typeof (params) === 'undefined') {
        params = {};
      }
      this.setupTable(table);
      var entity_array = [];
      var table_data = this.storage[table];
      if (params && params.where && params.where.id) {
        if (table_data[params.where.id]) {
          entity_array.push(table_data[params.where.id]);
        }
      } else {
        for (var id in table_data) {
          entity_array.push(table_data[id]);
        }
      }
      var filters = [];
      if (params && params.group) {
        filters.push(this.createGroupBy(params.group));
      }
      if (params && params.where) {
        filters.push(this.createWhere(params.where));
      }
      if (params && params.callback) {
        filters.push(this.createCallback(params.callback));
      }
      if (params && params.order) {
        filters.push(this.createOrderBy(params.order));
      }
      if (params && params.limit || params.offset) {
        filters.push(this.createLimit(params.limit, params.offset));
      }
      for (var i = 0; i < filters.length; ++i) {
        entity_array = filters[i](entity_array);
      }
      return this.iterableFromResultSet(entity_array);
    },
    paramsFromSQLString: function paramsFromSQLString(sql) {
      var params = {};
      var select = /\s*SELECT\s+.+\s+FROM\s+(\w+)\s+/i;
      var select_match = sql.match(select);
      var table = select_match[1];
      sql = sql.replace(select, '');
      var fragments = [
        ['limit', /(^|\s+)LIMIT\s+(.+)$/i],
        ['order', /(^|\s+)ORDER\s+BY\s+(.+)$/i],
        ['group', /(^|\s+)GROUP\s+BY\s+(.+)$/i],
        ['where', /(^|\s+)WHERE\s+(.+)$/i]
      ];
      for (var i = 0; i < fragments.length; ++i) {
        var param_name = fragments[i][0];
        var matcher = fragments[i][1];
        var match = sql.match(matcher);
        if (match) {
          params[param_name] = match[2];
          sql = sql.replace(matcher, '');
        }
      }
      return [table, params];
    },
    transaction: function transaction(proceed) {
      var backup = {};
      for (var table_name in this.storage) {
        backup[table_name] = ActiveSupport.Object.clone(this.storage[table_name]);
      }
      try {
        proceed();
      } catch (e) {
        this.storage = backup;
        throw e;
      }
    },
    //PRVIATE
    iterableFromResultSet: function iterableFromResultSet(result) {
      result.iterate = function iterate(iterator, context) {
        if (typeof (iterator) === 'number') {
          if (this[iterator]) {
            return ActiveSupport.Object.clone(this[iterator]);
          } else {
            return false;
          }
        } else {
          for (var i = 0; i < this.length; ++i) {
            var row = ActiveSupport.Object.clone(this[i]);
            iterator.apply(context, [row]);
          }
        }
      };
      return result;
    },
    setupTable: function setupTable(table) {
      if (!this.storage[table]) {
        this.storage[table] = {};
      }
    },
    createWhere: function createWhere(where) {
      if (ActiveSupport.Object.isArray(where)) {
        var where_fragment = where[0];
        for (var i = 1; i < where.length; ++i) {
          where_fragment = where_fragment.replace(/\?/, ActiveRecord.escape(where[i]));
        }
        where = where_fragment;
      }
      if (typeof (where) === 'string') {
        return function json_result_where_processor(result_set) {
          var response = [];
          var where_parser = new WhereParser();
          var abstract_syntax_tree = where_parser.parse(where);
          for (var i = 0; i < result_set.length; ++i) {
            if (abstract_syntax_tree.execute(result_set[i], Adapters.InMemory.method_call_handler)) {
              response.push(result_set[i]);
            }
          }
          return response;
        };
      } else {
        return function json_result_where_processor(result_set) {
          var response = [];
          for (var i = 0; i < result_set.length; ++i) {
            var included = true;
            for (var column_name in where) {
              if ((String(result_set[i][column_name])) != (String(where[column_name]))) {
                included = false;
                break;
              }
            }
            if (included) {
              response.push(result_set[i]);
            }
          }
          return response;
        };
      }
    },
    createCallback: function createCallback(callback) {
      return function json_result_callback_processor(result_set) {
        var response = [];
        for (var i = 0; i < result_set.length; ++i) {
          if (callback(result_set[i])) {
            response.push(result_set[i]);
          }
        }
        return response;
      };
    },
    createLimit: function createLimit(limit, offset) {
      return function json_result_limit_processor(result_set) {
        return result_set.slice(offset || 0, limit);
      };
    },
    createGroupBy: function createGroupBy(group_by) {
      if (!group_by || group_by == '') {
        return function json_result_group_by_processor(result_set) {
          return result_set;
        }
      }
      var group_key = group_by.replace(/(^[\s]+|[\s]+$)/g, '');
      return function json_result_group_by_processor(result_set) {
        var response = [];
        var indexed_by_group = {};
        for (var i = 0; i < result_set.length; ++i) {
          indexed_by_group[result_set[i][group_key]] = result_set[i];
        }
        for (var group_key_value in indexed_by_group) {
          response.push(indexed_by_group[group_key_value]);
        }
        return response;
      }
    },
    createOrderBy: function createOrderBy(order_by) {
      if (!order_by || order_by === '') {
        return function json_result_order_by_processor(result_set) {
          return result_set;
        };
      }
      var order_statements = order_by.split(',');
      var trimmed_order_statements = [];
      for (var i = 0; i < order_statements.length; ++i) {
        trimmed_order_statements.push(order_statements[i].replace(/(^[\s]+|[\s]+$)/g, '').replace(/[\s]{2,}/g, '').toLowerCase());
      }
      return function json_result_order_by_processor(result_set) {
        for (var i = 0; i < trimmed_order_statements.length; ++i) {
          var trimmed_order_statements_bits = trimmed_order_statements[i].split(/\s/);
          var column_name = trimmed_order_statements_bits[0];
          var reverse = trimmed_order_statements_bits[1] && trimmed_order_statements_bits[1] === 'desc';
          result_set = result_set.sort(function result_set_sorter(a, b) {
            return a[column_name] < b[column_name] ? -1 : a[column_name] > b[column_name] ? 1 : 0;
          });
          if (reverse) {
            result_set = result_set.reverse();
          }
        }
        return result_set;
      };
    },
    //schema
    createTable: function createTable(table_name, columns) {
      if (!this.storage[table_name]) {
        this.storage[table_name] = {};
      }
    },
    dropTable: function dropTable(table_name) {
      delete this.storage[table_name];
    },
    addColumn: function addColumn(table_name, column_name, data_type) {
      return; //no action needed
    },
    removeColumn: function removeColumn(table_name, column_name) {
      return; //no action needed
    },
    addIndex: function addIndex(table_name, column_names, options) {
      return; //no action needed
    },
    removeIndex: function removeIndex(table_name, index_name) {
      return; //no action needed
    },
    cachedObjectIsFieldDefinitionResults: {},
    cachedGetDefaultValueFromFieldDefinitionResults: {},
    fieldIn: function fieldIn(key_name, field, value) {
      if (value && value instanceof Date) {
        return ActiveSupport.dateFormat(value, 'yyyy-mm-dd HH:MM:ss');
      }
      if (typeof (this.cachedObjectIsFieldDefinitionResults[key_name]) == 'undefined') {
        this.cachedObjectIsFieldDefinitionResults[key_name] = Adapters.objectIsFieldDefinition(field);
      }
      if (this.cachedObjectIsFieldDefinitionResults[key_name]) {
        if (typeof (this.cachedGetDefaultValueFromFieldDefinitionResults[key_name]) == 'undefined') {
          this.cachedGetDefaultValueFromFieldDefinitionResults[key_name] = this.getDefaultValueFromFieldDefinition(field);
        }
        field = this.cachedGetDefaultValueFromFieldDefinitionResults[key_name];
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      return value;
    },
    fieldOut: function fieldOut(key_name, field, value) {
      if (typeof (this.cachedObjectIsFieldDefinitionResults[key_name]) == 'undefined') {
        this.cachedObjectIsFieldDefinitionResults[key_name] = Adapters.objectIsFieldDefinition(field);
      }
      if (this.cachedObjectIsFieldDefinitionResults[key_name]) {
        //date handling
        if (field.type.toLowerCase().match(/date/) && typeof (value) == 'string') {
          return ActiveSupport.dateFromDateTime(value);
        }
        if (typeof (this.cachedGetDefaultValueFromFieldDefinitionResults[key_name]) == 'undefined') {
          this.cachedGetDefaultValueFromFieldDefinitionResults[key_name] = this.getDefaultValueFromFieldDefinition(field);
        }
        field = this.cachedGetDefaultValueFromFieldDefinitionResults[key_name];
      }
      value = this.setValueFromFieldIfValueIsNull(field, value);
      return value;
    }
  });

  Adapters.InMemory.method_call_handler = function method_call_handler(name, row, args) {
    if (!Adapters.InMemory.MethodCallbacks[name]) {
      name = name.toLowerCase().replace(/\_[0-9A-Z-a-z]/g, function camelize_underscores(match) {
        return match.toUpperCase();
      });
    }
    if (!Adapters.InMemory.MethodCallbacks[name]) {
      throw Errors.MethodDoesNotExist.getErrorString('"' + name + '"' + ' was called from a sql statement.');
    } else {
      return Adapters.InMemory.MethodCallbacks[name].apply(Adapters.InMemory.MethodCallbacks[name], [row].concat(args || []));
    }
  };
  Adapters.InMemory.MethodCallbacks = (function () {
    var methods = {};
    var math_methods = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'];
    for (var i = 0; i < math_methods.length; ++i) {
      methods[math_methods[i]] = (function math_method_generator(i) {
        return function generated_math_method() {
          return Math[math_methods[i]].apply(Math.math_methods[i], ActiveSupport.Array.from(arguments).slice(1));
        };
      })(i);
    }
    return methods;
  })();

  Adapters.InMemory.connect = function (storage) {
    return new Adapters.InMemory(storage || {});
  };

  

  //var WhereLexer;
  var WhereParser;

  //(function() {
  // token types
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

  // this is here mostly for debugging messages
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

  // map operators and keywords to their propery type
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

  // Lexer token patterns
  var WHITESPACE_PATTERN = /^\s+/;
  var IDENTIFIER_PATTERN = /^[a-zA-Z\_][a-zA-Z\_]*/;
  var OPERATOR_PATTERN = /^(?:&&|\|\||<=|<|=|!=|>=|>|,|\(|\))/i;
  var KEYWORD_PATTERN = /^(true|or|in|false|and)\b/i;
  var STRING_PATTERN = /^(?:'(\\.|[^'])*'|"(\\.|[^"])*")/;
  var NUMBER_PATTERN = /^[1-9][0-9]*/;

  // Current lexeme to parse
  var currentLexeme;

  // Lexeme class

  function Lexeme(type, text) {
    this.type = type;
    this.typeName = null;
    this.text = text;
  }

  Lexeme.prototype.toString = function toString() {
    if (this.typeName) {
      return "[" + this.typeName + "]~" + this.text + "~";
    } else {
      return "[" + this.type + "]~" + this.text + "~";
    }
  };

  // Lexer class

  function WhereLexer() {
    // initialize
    this.setSource(null);
  }

  WhereLexer.prototype.setSource = function setSource(source) {
    this.source = source;
    this.offset = 0;
    this.length = (source !== null) ? source.length : 0;

    currentLexeme = null;
  };

  WhereLexer.prototype.advance = function advance() {
    var inWhitespace = true;
    var result = null;

    while (inWhitespace) {
      // assume not in whitespace
      inWhitespace = false;

      // clear possible last whitespace result
      result = null;

      if (this.offset < this.length) {
        var match, text, type;

        // NOTE: [KEL] Switching on the first character may speed things up
        // here.
        if ((match = WHITESPACE_PATTERN.exec(this.source)) !== null) {
          result = new Lexeme(WHITESPACE, match[0]);
          inWhitespace = true;
        } else if ((match = OPERATOR_PATTERN.exec(this.source)) !== null) {
          text = match[0];
          type = OperatorMap[text.toLowerCase()];

          result = new Lexeme(type, text);
        } else if ((match = KEYWORD_PATTERN.exec(this.source)) !== null) {
          text = match[0];
          type = KeywordMap[text.toLowerCase()];

          result = new Lexeme(type, text);
        } else if ((match = STRING_PATTERN.exec(this.source)) !== null) {
          result = new Lexeme(STRING, match[0]);
        } else if ((match = NUMBER_PATTERN.exec(this.source)) !== null) {
          result = new Lexeme(NUMBER, match[0]);
        } else if ((match = IDENTIFIER_PATTERN.exec(this.source)) !== null) {
          result = new Lexeme(IDENTIFIER, match[0]);
        } else {
          result = new Lexeme(ERROR, this.source);
        }

        // assign type name, if we have one
        if (TypeMap[result.type]) {
          result.typeName = TypeMap[result.type];
        }

        // update source state
        var length = result.text.length;
        this.offset += length;
        this.source = this.source.substring(length);
      }
    }

    // expose result
    currentLexeme = result;

    return result;
  };

  // Binary operator node

  function BinaryOperatorNode(lhs, operator, rhs) {
    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs;
  }

  BinaryOperatorNode.prototype.execute = function execute(row, functionProvider) {
    var result = null;
    var lhs = this.lhs.execute(row, functionProvider);

    if (this.operator == IN) {
      // assume failure
      result = false;

      // see if the lhs value is in the rhs list
      for (var i = 0; i < this.rhs.length; i++) {
        var rhs = this.rhs[i].execute(row, functionProvider);

        if (lhs == rhs) {
          result = true;
          break;
        }
      }
    } else {
      var rhs = this.rhs.execute(row, functionProvider);

      switch (this.operator) {
      case EQUAL:
        result = (lhs === rhs);
        break;

      case NOT_EQUAL:
        result = (lhs !== rhs);
        break;

      case LESS_THAN:
        result = (lhs < rhs);
        break;

      case LESS_THAN_EQUAL:
        result = (lhs <= rhs);
        break;

      case GREATER_THAN:
        result = (lhs > rhs);
        break;

      case GREATER_THAN_EQUAL:
        result = (lhs >= rhs);
        break;

      case AND:
        result = (lhs && rhs);
        break;

      case OR:
        result = (lhs || rhs);
        break;

      default:
        throw new Error("Unknown operator type: " + this.operator);
      }
    }

    return result;
  };

  // Identifer node

  function IdentifierNode(identifier) {
    this.identifier = identifier;
  }

  IdentifierNode.prototype.execute = function execute(row, functionProvider) {
    return row[this.identifier];
  };

  // Function node

  function FunctionNode(name, args) {
    this.name = name;
    this.args = args;
  }

  FunctionNode.prototype.execute = function execute(row, functionProvider) {
    // evaluate arguments
    var args = new Array(this.args.length);

    for (var i = 0; i < this.args.length; i++) {
      args[i] = this.args[i].execute(row, functionProvider);
    }

    // evaluate function and return result
    return functionProvider(this.name, row, args);
  };

  // Scalar node

  function ScalarNode(value) {
    this.value = value;
  }

  ScalarNode.prototype.execute = function execute(row, functionProvider) {
    return this.value;
  };


  // Parser class
  WhereParser = function WhereParser() {
    this._lexer = new WhereLexer();
  };

  WhereParser.prototype.parse = function parse(source) {
    var result = null;

    // clear current lexeme cache
    currentLexeme = null;

    // pass source to lexer
    this._lexer.setSource(source);

    // prime the lexeme pump
    this._lexer.advance();

    // parse it
    while (currentLexeme !== null) {
      // fast fail
      switch (currentLexeme.type) {
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
    }
    return result;
  };

  WhereParser.prototype.parseInExpression = function parseInExpression() {
    var result = this.parseOrExpression();

    while (currentLexeme !== null && currentLexeme.type === IN) {
      // advance over 'in'
      this._lexer.advance();

      var rhs = [];

      if (currentLexeme !== null && currentLexeme.type === LPAREN) {
        // advance over '('
        this._lexer.advance();

        while (currentLexeme !== null) {
          rhs.push(this.parseOrExpression());

          if (currentLexeme !== null && currentLexeme.type === COMMA) {
            this._lexer.advance();
          } else {
            break;
          }
        }

        if (currentLexeme !== null && currentLexeme.type === RPAREN) {
          this._lexer.advance();

          result = new BinaryOperatorNode(result, IN, rhs);
        } else {
          throw new Error("'in' list did not end with a right parenthesis." + currentLexeme);
        }
      } else {
        throw new Error("'in' list did not start with a left parenthesis");
      }
    }

    return result;
  };

  WhereParser.prototype.parseOrExpression = function parseOrExpression() {
    var result = this.parseAndExpression();

    while (currentLexeme !== null && currentLexeme.type === OR) {
      // advance over 'or' or '||'
      this._lexer.advance();

      var rhs = this.parseAndExpression();

      result = new BinaryOperatorNode(result, OR, rhs);
    }

    return result;
  };

  WhereParser.prototype.parseAndExpression = function parseAndExpression() {
    var result = this.parseEqualityExpression();

    while (currentLexeme !== null && currentLexeme.type === AND) {
      // advance over 'and' or '&&'
      this._lexer.advance();

      var rhs = this.parseEqualityExpression();

      result = new BinaryOperatorNode(result, AND, rhs);
    }

    return result;
  };

  WhereParser.prototype.parseEqualityExpression = function parseEqualityExpression() {
    var result = this.parseRelationalExpression();

    if (currentLexeme !== null) {
      var type = currentLexeme.type;

      switch (type) {
      case EQUAL:
      case NOT_EQUAL:
        // advance over '=' or '!='
        this._lexer.advance();

        var rhs = this.parseRelationalExpression();

        result = new BinaryOperatorNode(result, type, rhs);
        break;
      }
    }

    return result;
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
        // advance over '<', '<=', '>' or '>='
        this._lexer.advance();

        var rhs = this.parseMemberExpression();

        result = new BinaryOperatorNode(result, type, rhs);
        break;
      }
    }

    return result;
  };

  WhereParser.prototype.parseMemberExpression = function parseMemberExpression() {
    var result = null;

    if (currentLexeme !== null) {
      switch (currentLexeme.type) {
      case IDENTIFIER:
        result = new IdentifierNode(currentLexeme.text);
        // advance over identifier
        this._lexer.advance();

        if (currentLexeme !== null && currentLexeme.type === LPAREN) {
          // this is a function
          var name = result.identifier;
          var args = [];

          // advance over '('
          this._lexer.advance();

          // process arguments
          while (currentLexeme !== null && currentLexeme.type !== RPAREN) {
            args.push(this.parseOrExpression());

            if (currentLexeme !== null && currentLexeme.type === COMMA) {
              this._lexer.advance();
            }
          }

          // advance over ')'
          if (currentLexeme !== null) {
            this._lexer.advance();
            result = new FunctionNode(name, args);
          } else {
            throw new Error("Function argument list was not closed with a right parenthesis.");
          }
        }
        break;

      case TRUE:
        result = new ScalarNode(true);

        // advance over 'true'
        this._lexer.advance();
        break;

      case FALSE:
        result = new ScalarNode(false);

        // advance over 'false'
        this._lexer.advance();
        break;

      case NUMBER:
        result = new ScalarNode(currentLexeme.text - 0);

        // advance over number
        this._lexer.advance();
        break;

      case STRING:
        var text = currentLexeme.text;

        result = new ScalarNode(text.substring(1, text.length - 1));

        // advance over string
        this._lexer.advance();
        break;

      case LPAREN:
        // advance over '('
        this._lexer.advance();

        result = this.parseOrExpression();

        if (currentLexeme !== null && currentLexeme.type === RPAREN) {
          // advance over ')'
          this._lexer.advance();
        } else {
          throw new Error("Missing closing right parenthesis: " + currentLexeme);
        }
        break;
      }
    }

    return result;
  };


  //})();
  //ActiveRecord.WhereLexer = WhereLexer;
  ActiveRecord.WhereParser = WhereParser;
  var Finders = {
    mergeOptions: function mergeOptions(field_name, value, options) {
      if (!options) {
        options = {};
      }
      options = ActiveSupport.Object.clone(options);
      if (options.where) {
        options.where[field_name] = value;
      } else {
        options.where = {};
        options.where[field_name] = value;
      }
      return options;
    },
    generateFindByField: function generateFindByField(klass, field_name) {
      klass['findBy' + ActiveSupport.String.camelize(field_name, true)] = ActiveSupport.Function.curry(function generated_find_by_field_delegator(klass, field_name, value, options) {
        return klass.find(ActiveSupport.Object.extend(Finders.mergeOptions(field_name, value, options), {
          first: true
        }));
      }, klass, field_name);
    },
    generateFindAllByField: function generateFindAllByField(klass, field_name) {
      klass['findAllBy' + ActiveSupport.String.camelize(field_name, true)] = ActiveSupport.Function.curry(function generated_find_all_by_field_delegator(klass, field_name, value, options) {
        return klass.find(ActiveSupport.Object.extend(Finders.mergeOptions(field_name, value, options), {
          all: true
        }));
      }, klass, field_name);
    }
  };
  ActiveRecord.Finders = Finders;
  var Indicies = {
    initializeIndicies: function initializeIndicies(storage) {
      var model_name, model, table_name, index_name, index, index_callbacks, id;
      for (model_name in ActiveRecord.Models) {
        model = ActiveRecord.Models[model_name];
        if (model.indexingCallbacks) {
          table_name = model.tableName;
          for (index_name in model.indexingCallbacks) {
            index = model.indexed[index_name];
            index_callbacks = model.indexingCallbacks[index_name];
            for (id in storage[table_name]) {
              index_callbacks.afterSave(index, storage[table_name][id]);
            }
          }
        }
      }

    }
  };

  /**
   * ActiveRecord.Model.addIndex(name,index,callbacks) -> null
   * - index_name (name)
   * - index (Object)
   * - callbacks (Object): Must contain "afterSave" and "afterDestroy" keys containing callback functions.
   *
   * Allows the construction of arbitrary data indicies from data in your models.
   * Indicies will stay up to date as records are created, saved or destroyed.
   *
   * The afterSave and afterDestroy objects will only receive the data for a
   * given record (generated with instance.toObject()). The afterSave callback
   * will handle both the create and update scenarios.
   *
   *     Photo.addIndex('byName',{},{
   *         afterSave: function(index,photo){
   *             index[photo.name] = photo.id;
   *         },
   *         afterDestroy: function(index,photo){
   *             delete index[photo.name];
   *         }
   *     });
   *     var flower_record = Photo.create({name:'flower'});
   *     Photo.indexed.byName.flower == flower_record;
   *
   * If you only need and index of key => id pairs (name => id pairs in the
   * example above), you can shorten the call to the following:
   *
   *     Photo.addIndex('byName','name'):
   *
   * A more complicated example, which pre fills an index object:
   *
   *     var index = {a:{},b:{},c:{}};
   *
   *     Contact.addIndex('byLetter',index,{
   *         afterSave: function(index,contact){
   *             var first_letter = contact.name.substring(0,1).toLowerCase();
   *             index[first_letter][contact.id] = contact;
   *         },
   *         afterDestroy: function(index,contact){
   *             var first_letter = contact.name.substring(0,1).toLowerCase();
   *             delete index[first_letter][contact.id];
   *         }
   *     });
   *
   *     //the index will now be available at:
   *     Contact.indexed.byLetter;
   *
   *     Contact.create({name: 'Abbey'});
   *
   *     for(var id in Contact.indexed.byLetter.a){}
   **/
  ActiveRecord.ClassMethods.addIndex = function addIndex(name, index, callbacks) {
    if (!callbacks) {
      if (typeof (index) == 'string') {
        var key_name = index;
        index = {};
        callbacks = {
          afterSave: function afterSaveIndexCallback(index, item) {
            index[item[key_name]] = item.id;
          },
          afterDestroy: function afterDestroyIndexCallback(index, item) {
            delete index[item[key_name]];
          }
        };
      } else {
        callbacks = index;
        index = {};
      }
    }
    if (!this.indexed) {
      this.indexed = {};
    }
    if (!this.indexingCallbacks) {
      this.indexingCallbacks = {};
    }
    if (!this.indexingCallbackObservers) {
      this.indexingCallbackObservers = {};
    }
    this.indexed[name] = index || {};
    this.indexingCallbacks[name] = callbacks;
    this.indexingCallbackObservers[name] = {};
    this.indexingCallbackObservers[name].afterSave = this.observe('afterSave', ActiveSupport.Function.bind(function afterSaveIndexObserver(instance) {
      callbacks.afterSave(this.indexed[name], instance.toObject());
    }, this));
    this.indexingCallbackObservers[name].afterDestroy = this.observe('afterDestroy', ActiveSupport.Function.bind(function afterDestroyIndexObserver(instance) {
      callbacks.afterDestroy(this.indexed[name], instance.toObject());
    }, this));
  };

  /**
   * ActiveRecord.Model.removeIndex(index_name) -> null
   **/
  ActiveRecord.ClassMethods.removeIndex = function removeIndex(name) {
    this.stopObserving('afterSave', this.indexingCallbackObservers[name].afterSave);
    this.stopObserving('afterDestroy', this.indexingCallbackObservers[name].afterDestroy);
    delete this.indexingCallbacks[name];
    delete this.indexed[name];
  };

  ActiveRecord.Indicies = Indicies;
  /**
   * class ActiveRecord.ResultSet
   * When using any finder method, the returned array will be extended
   * with the methods in this namespace. A returned result set is still
   * an instance of Array.
   **/
  var ResultSet = {};

  ResultSet.InstanceMethods = {
    /**
     * ActiveRecord.ResultSet#reload() -> null
     * Re-runs the query that generated the result set. This modifies the
     * array in place and does not return a new array.
     **/
    reload: function reload(result_set, params, model) {
      result_set.length = 0;
      var new_response = model.find(ActiveSupport.Object.extend(ActiveSupport.Object.clone(params)));
      for (var i = 0; i < new_response.length; ++i) {
        result_set.push(new_response[i]);
      }
    },
    /**
     * ActiveRecord.ResultSet#toArray() -> Array
     * Builds an array calling toObject() on each instance in the result
     * set, thus reutrning a vanilla array of vanilla objects.
     **/
    toArray: function toArray(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) {
        items.push(result_set[i].toObject());
      }
      return items;
    },
    /**
     * ActiveRecord.ResultSet#toJSON() -> String
     **/
    toJSON: function toJSON(result_set, params, model) {
      var items = [];
      for (var i = 0; i < result_set.length; ++i) {
        items.push(result_set[i].toSerializableObject());
      }
      return items;
    }
  };
  var Relationships = {
    normalizeModelName: function (related_model_name) {
      var plural = ActiveSupport.String.camelize(related_model_name, true);
      var singular = ActiveSupport.String.camelize(ActiveSupport.String.singularize(plural) || plural, true);
      return singular || plural;
    },
    normalizeForeignKey: function (foreign_key, related_model_name) {
      var plural = ActiveSupport.String.underscore(related_model_name).toLowerCase();
      var singular = ActiveSupport.String.singularize(plural) || plural;
      if (!foreign_key || typeof (foreign_key) === 'undefined') {
        return (singular || plural) + '_id';
      } else {
        return foreign_key;
      }
    }
  };
  ActiveRecord.Relationships = Relationships;
  /**
   * ActiveRecord.Model.hasOne(related_model_name[,options]) -> null
   * Sepcifies a 1->1 relationship between models. The foreign key will reside in the related object.
   * - related_model_name (String): Can be a plural or singular referring to the related table, the model name, or a reference to the model itself ("users","User" or User would all work).
   * - options (Object)
   *
   * Options can contain:
   *
   * - foreignKey (String)
   * - name (String)
   * - dependent (Boolean)
   *
   *     User.hasOne(CreditCard);
   *     var u = User.find(5);
   *     //each User instance will gain the following 3 methods
   *     u.getCreditCard()
   *     u.buildCreditCard()
   *     u.createCreditCard()
   **/
  ActiveRecord.ClassMethods.hasOne = function hasOne(related_model_name, options) {
    this.relationships.push(['hasOne', related_model_name, options]);
    if (related_model_name && related_model_name.modelName) {
      related_model_name = related_model_name.modelName;
    }
    if (!options) {
      options = {};
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, Relationships.normalizeModelName(related_model_name));
    var class_methods = {};
    var instance_methods = {};
    instance_methods['get' + relationship_name] = ActiveSupport.Function.curry(function getRelated(related_model_name, foreign_key) {
      var id = this.get(foreign_key);
      if (id) {
        return ActiveRecord.Models[related_model_name].find(id);
      } else {
        return false;
      }
    }, related_model_name, foreign_key);
    class_methods['build' + relationship_name] = instance_methods['build' + relationship_name] = ActiveSupport.Function.curry(function buildRelated(related_model_name, foreign_key, params) {
      return ActiveRecord.Models[related_model_name].build(params || {});
    }, related_model_name, foreign_key);
    instance_methods['create' + relationship_name] = ActiveSupport.Function.curry(function createRelated(related_model_name, foreign_key, params) {
      var record = ActiveRecord.Models[related_model_name].create(params || {});
      if (this.get(this.constructor.primaryKeyName)) {
        this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName));
      }
      return record;
    }, related_model_name, foreign_key);
    ActiveSupport.Object.extend(this.prototype, instance_methods);
    ActiveSupport.Object.extend(this, class_methods);

    //dependent
    if (options.dependent) {
      this.observe('afterDestroy', function destroyRelatedDependent(record) {
        var child = record['get' + relationship_name]();
        if (child) {
          child.destroy();
        }
      });
    }
  };
  /**
   * ActiveRecord.Model.hasMany(related_model_name[,options]) -> null
   * Sepcifies a 1->N relationship between models. The foreign key will reside in the child (related) object.
   * - related_model_name (String): Can be a plural or singular referring to the related table, the model name, or a reference to the model itself ("users","User" or User would all work).
   * - options (Object)
   *
   * Options can contain:
   *
   * - foreignKey (String)
   * - name (String)
   * - dependent (Boolean)
   * - order (String)
   * - where (String)
   *
   *     User.hasMany('comments',{
   *         dependent: true
   *     });
   *     var u = User.find(5);
   *     //each User instance will gain the following 5 methods
   *     u.createComment()
   *     u.buildComment()
   *     u.destroyComment()
   *     u.getCommentList() //takes the same options as find()
   *     u.getCommentCount() //takes the same options as count()
   **/
  ActiveRecord.ClassMethods.hasMany = function hasMany(related_model_name, options) {
    this.relationships.push(['hasMany', related_model_name, options]);
    if (related_model_name && related_model_name.modelName) {
      related_model_name = related_model_name.modelName;
    }
    if (!options) {
      options = {};
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var original_related_model_name = related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, Relationships.normalizeModelName(this.modelName));
    var class_methods = {};
    var instance_methods = {};

    if (options.through) {
      var through_model_name = Relationships.normalizeModelName(options.through);
      instance_methods['get' + relationship_name + 'List'] = ActiveSupport.Function.curry(function getRelatedListForThrough(through_model_name, related_model_name, foreign_key, params) {
        var related_list = this['get' + through_model_name + 'List']();
        var ids = [];
        var response = [];
        for (var i = 0; i < related_list.length; ++i) {
          response.push(related_list[i]['get' + related_model_name]());
        }
        return response;
      }, through_model_name, related_model_name, foreign_key);

      instance_methods['get' + relationship_name + 'Count'] = ActiveSupport.Function.curry(function getRelatedCountForThrough(through_model_name, related_model_name, foreign_key, params) {
        if (!params) {
          params = {};
        }
        if (!params.where) {
          params.where = {};
        }
        params.where[foreign_key] = this.get(this.constructor.primaryKeyName);
        return ActiveRecord.Models[through_model_name].count(params);
      }, through_model_name, related_model_name, foreign_key);
    } else {
      instance_methods['destroy' + relationship_name] = class_methods['destroy' + relationship_name] = ActiveSupport.Function.curry(function destroyRelated(related_model_name, foreign_key, params) {
        var record = ActiveRecord.Models[related_model_name].find((params && typeof (params.get) === 'function') ? params.get(params.constructor.primaryKeyName) : params);
        if (record) {
          return record.destroy();
        } else {
          return false;
        }
      }, related_model_name, foreign_key);

      instance_methods['get' + relationship_name + 'List'] = ActiveSupport.Function.curry(function getRelatedList(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!id) {
          return this.constructor.resultSetFromArray([]);
        }
        if (!params) {
          params = {};
        }
        if (options.order && !('order' in params)) {
          params.order = options.order;
        }
        if (!params.where) {
          params.where = {};
        }
        params.where[foreign_key] = id;
        params.all = true;
        return ActiveRecord.Models[related_model_name].find(params);
      }, related_model_name, foreign_key);

      instance_methods['get' + relationship_name + 'Count'] = ActiveSupport.Function.curry(function getRelatedCount(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!id) {
          return 0;
        }
        if (!params) {
          params = {};
        }
        if (!params.where) {
          params.where = {};
        }
        params.where[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].count(params);
      }, related_model_name, foreign_key);

      instance_methods['build' + relationship_name] = ActiveSupport.Function.curry(function buildRelated(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!params) {
          params = {};
        }
        params[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].build(params);
      }, related_model_name, foreign_key);

      instance_methods['create' + relationship_name] = ActiveSupport.Function.curry(function createRelated(related_model_name, foreign_key, params) {
        var id = this.get(this.constructor.primaryKeyName);
        if (!params) {
          params = {};
        }
        params[foreign_key] = id;
        return ActiveRecord.Models[related_model_name].create(params);
      }, related_model_name, foreign_key);
    }

    ActiveSupport.Object.extend(this.prototype, instance_methods);
    ActiveSupport.Object.extend(this, class_methods);

    //dependent
    if (options.dependent) {
      this.observe('afterDestroy', function destroyDependentChildren(record) {
        var list = record['get' + relationship_name + 'List']();
        if (ActiveRecord.logging) {
          ActiveSupport.log('Relationships.hasMany destroy ' + list.length + ' dependent ' + related_model_name + ' children of ' + record.modelName);
        }
        for (var i = 0; i < list.length; ++i) {
          list[i].destroy();
        }
      });
    }
  };
  /**
   * ActiveRecord.Model.belongsTo(related_model_name[,options]) -> null
   * Sepcifies a 1<-1 relationship between models. The foreign key will reside in the declaring object.
   * - related_model_name (String): Can be a plural or singular referring to the related table, the model name, or a reference to the model itself ("users","User" or User would all work).
   * - options (Object)
   *
   * Options can contain:
   *
   * - foreignKey (String)
   * - name (String)
   * - counter (String)
   *
   *     Comment.belongsTo('User',{
   *         counter: 'comment_count' //comment count must be a column in User
   *     });
   *     var c = Comment.find(5);
   *     //each Comment instance will gain the following 3 methods
   *     c.getUser()
   *     c.buildUser()
   *     c.createUser()
   **/
  ActiveRecord.ClassMethods.belongsTo = function belongsTo(related_model_name, options) {
    this.relationships.push(['belongsTo', related_model_name, options]);
    if (related_model_name && related_model_name.modelName) {
      related_model_name = related_model_name.modelName;
    }
    if (!options) {
      options = {};
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, related_model_name);
    var class_methods = {};
    var instance_methods = {};
    instance_methods['get' + relationship_name] = ActiveSupport.Function.curry(function getRelated(related_model_name, foreign_key) {
      var id = this.get(foreign_key);
      if (id) {
        return ActiveRecord.Models[related_model_name].find(id);
      } else {
        return false;
      }
    }, related_model_name, foreign_key);
    instance_methods['build' + relationship_name] = class_methods['build' + relationship_name] = ActiveSupport.Function.curry(function buildRelated(related_model_name, foreign_key, params) {
      var record = ActiveRecord.Models[related_model_name].build(params || {});
      if (options.counter) {
        record[options.counter] = 1;
      }
      return record;
    }, related_model_name, foreign_key);
    instance_methods['create' + relationship_name] = ActiveSupport.Function.curry(function createRelated(related_model_name, foreign_key, params) {
      var record = this['build' + related_model_name](params);
      if (record.save() && this.get(this.constructor.primaryKeyName)) {
        this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName));
      }
      return record;
    }, related_model_name, foreign_key);
    ActiveSupport.Object.extend(this.prototype, instance_methods);
    ActiveSupport.Object.extend(this, class_methods);

    //counter
    if (options.counter) {
      this.observe('afterDestroy', function decrementBelongsToCounter(record) {
        var child = record['get' + relationship_name]();
        if (child) {
          var current_value = child.get(options.counter);
          if (typeof (current_value) === 'undefined') {
            current_value = 0;
          }
          child.updateAttribute(options.counter, Math.max(0, parseInt(current_value, 10) - 1));
        }
      });
      this.observe('afterCreate', function incrementBelongsToCounter(record) {
        var child = record['get' + relationship_name]();
        if (child) {
          var current_value = child.get(options.counter);
          if (typeof (current_value) === 'undefined') {
            current_value = 0;
          }
          child.updateAttribute(options.counter, parseInt(current_value, 10) + 1);
        }
      });
    }
  };

  //TODO: Add Migrations





  ActiveSupport.Object.extend(ActiveRecord.ClassMethods, {
    /**
     * ActiveRecord.Model.addValidator(callback) -> null
     * Adds the validator to the _validators array of a given ActiveRecord.Model.
     **/
    addValidator: function addValidator(validator) {
      if (!this._validators) {
        this._validators = [];
      }
      this._validators.push(validator);
    },
    /**
     * ActiveRecord.Model.validatesPresenceOf(field_name[,options]) -> null
     **/
    validatesPresenceOf: function validatesPresenceOf(field, options) {
      options = ActiveSupport.Object.extend({

      }, options || {});
      this.addValidator(function validates_presence_of_callback() {
        if (!this.get(field) || this.get(field) === '') {
          this.addError(options.message || (field + ' is not present.'), field);
        }
      });
    },
    /**
     * ActiveRecord.Model.validatesLengthOf(field_name[,options]) -> null
     * Accepts "min" and "max" numbers as options.
     **/
    validatesLengthOf: function validatesLengthOf(field, options) {
      options = ActiveSupport.Object.extend({
        min: 1,
        max: 9999
      }, options || {});
      //will run in scope of an ActiveRecord instance
      this.addValidator(function validates_length_of_callback() {
        var value = String(this.get(field));
        if (value.length < options.min) {
          this.addError(options.message || (field + ' is too short.'), field);
        }
        if (value.length > options.max) {
          this.addError(options.message || (field + ' is too long.'), field);
        }
      });
    }
  });
  ActiveSupport.Object.extend(ActiveRecord.InstanceMethods, {
    /**
     * ActiveRecord.Model#addError(message[,field_name]) -> null
     **/
    addError: function addError(str, field) {
      var error = null;
      if (field) {
        error = [str, field];
        error.toString = function toString() {
          return field ? field + ": " + str : str;
        };
      } else {
        error = str;
      }
      this._errors.push(error);
    },
    isValid: function isValid() {
      return this._errors.length === 0;
    },
    _validate: function _validate() {
      this._errors = [];
      var validators = this.getValidators();
      for (var i = 0; i < validators.length; ++i) {
        validators[i].apply(this);
      }
      if (typeof (this.validate) === 'function') {
        this.validate();
      }
      if (ActiveRecord.logging) {
        ActiveSupport.log('ActiveRecord.validate() ' + String(this._errors.length === 0) + (this._errors.length > 0 ? '. Errors: ' + String(this._errors) : ''));
      }
      return this._errors.length === 0;
    },
    getValidators: function getValidators() {
      return this.constructor._validators || [];
    },
    /**
     * ActiveRecord.Model#getErrors() -> Array
     **/
    getErrors: function getErrors() {
      return this._errors;
    }
  });


  /**
   * Adapter for Microsoft Access
   *
   * Requires lib_msaccess
   *
   */
  ActiveRecord.Adapters.msaccess = function() {
    ActiveSupport.Object.extend(this, ActiveRecord.Adapters.InstanceMethods);
    ActiveSupport.Object.extend(this, ActiveRecord.Adapters.SQL);
    ActiveSupport.Object.extend(this, {
      quoteIdentifier: function(field) {
        return '[' + field + ']';
      },
      executeSQL: function executeSQL(sql) {
        var params = Array.prototype.slice.call(arguments, 1);
        var i = 0;
        sql = sql.replace(/\?/g, function() {
          return '$' + (++i);
        });
        ActiveSupport.log("Adapters.msaccess.executeSQL: " + sql + " [" + params.join(',') + "]");
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
//      createTable: function createTable(table_name, columns) {
//        var keys = ActiveSupport.Object.keys(columns);
//        var fragments = [];
//        for (var i = 0; i < keys.length; ++i) {
//          var key = keys[i];
//          if (columns[key].primaryKey) {
//            var type = columns[key].type || "COUNTER";
//            fragments.unshift("[" + key + "] " + type + " CONSTRAINT [pk_" + key + "] PRIMARY KEY")
//          } else {
//            fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key, columns))
//          }
//        }
//        return this.executeSQL("CREATE TABLE [" + table_name + "] (" + fragments.join(", ") + ")")
//      },
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

