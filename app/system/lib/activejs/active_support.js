/*!
 * ActiveSupport
 *
 * Provides a number of methods from the Prototype.js framework, without modifying any built in
 * prototypes to ensure compatibility and portability.
 */
if (!this.lib_activesupport) this.lib_activesupport = lib_activesupport;
function lib_activesupport() {
  var ActiveSupport, JSON = lib('json');

  ActiveSupport = {
    log: function log() {
      if (typeof console !== "undefined") {
        console.log.apply(console, arguments);
      }
    },
    createError: function createError(message) {
      return {
        getErrorString: function getErrorString() {
          var output = String(message);
          for (var i = 0; i < arguments.length; ++i) output = output.replace(/\%/, arguments[i].toString ? arguments[i].toString() : String(arguments[i]));
          return output
        }
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
      if (Array.prototype.indexOf) return array.indexOf(item, i);
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
    map: function map(array, iterator, context) {
      var length = array.length;
      context = context || window;
      var response = new Array(length);
      for (var i = 0; i < length; ++i) if (array[i]) response[i] = iterator.call(context, array[i], i, array);
      return response
    },
    bind: function bind(func, object) {
      if (typeof object == "undefined") return func;
      if (arguments.length < 3) return function bound() {
        return func.apply(object, arguments)
      };
      else {
        var args = ActiveSupport.arrayFrom(arguments);
        args.shift();
        args.shift();
        return function bound() {
          return func.apply(object, args.concat(ActiveSupport.arrayFrom(arguments)))
        }
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
        return wrapper.apply(this, [ActiveSupport.bind(func, this)].concat(ActiveSupport.arrayFrom(arguments)))
      }
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
    extend: function extend(destination, source) {
      for (var property in source) destination[property] = source[property];
      return destination
    },
    clone: function clone(object) {
      return ActiveSupport.extend({}, object)
    }
  }

  ActiveSupport.Inflector = {
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
      uncountable: ["sheep", "fish", "series", "species", "money", "rice", "information", "info", "equipment", "media"]
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
      var i, lc = word.toLowerCase();
      for (i = 0; i < ActiveSupport.Inflector.Inflections.uncountable.length; i++) {
        var uncountable = ActiveSupport.Inflector.Inflections.uncountable[i];
        if (lc === uncountable) return word
      }
      for (i = 0; i < ActiveSupport.Inflector.Inflections.irregular.length; i++) {
        var singular = ActiveSupport.Inflector.Inflections.irregular[i][0];
        var plural = ActiveSupport.Inflector.Inflections.irregular[i][1];
        if (lc === singular || lc === plural) return plural
      }
      for (i = 0; i < ActiveSupport.Inflector.Inflections.plural.length; i++) {
        var regex = ActiveSupport.Inflector.Inflections.plural[i][0];
        var replace_string = ActiveSupport.Inflector.Inflections.plural[i][1];
        if (regex.test(word)) return word.replace(regex, replace_string)
      }
      return word
    },
    singularize: function singularize(word) {
      var i, lc = word.toLowerCase();
      for (i = 0; i < ActiveSupport.Inflector.Inflections.uncountable.length; i++) {
        var uncountable = ActiveSupport.Inflector.Inflections.uncountable[i];
        if (lc === uncountable) return word
      }
      for (i = 0; i < ActiveSupport.Inflector.Inflections.irregular.length; i++) {
        var singular = ActiveSupport.Inflector.Inflections.irregular[i][0];
        var plural = ActiveSupport.Inflector.Inflections.irregular[i][1];
        if (lc === singular || lc === plural) return singular
      }
      for (i = 0; i < ActiveSupport.Inflector.Inflections.singular.length; i++) {
        var regex = ActiveSupport.Inflector.Inflections.singular[i][0];
        var replace_string = ActiveSupport.Inflector.Inflections.singular[i][1];
        if (regex.test(word)) return word.replace(regex, replace_string)
      }
      return word
    }
  };

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
  ActiveSupport.JSON = JSON;

  return ActiveSupport;
}
