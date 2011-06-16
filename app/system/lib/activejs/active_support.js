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
    createError: function(message) {
      return {
        getErrorString: function() {
          var output = String(message);
          for (var i = 0; i < arguments.length; ++i) output = output.replace(/\%/, arguments[i].toString ? arguments[i].toString() : String(arguments[i]));
          return output
        }
      }
    },
    without: function(arr) {
      var values = toArray(arguments).slice(1);
      var response = [];
      for (var i = 0; i < arr.length; i++) if (!(values.indexOf(arr[i]) > -1)) response.push(arr[i]);
      return response
    },
    map: function(array, iterator, context) {
      var length = array.length;
      context = context || window;
      var response = new Array(length);
      for (var i = 0; i < length; ++i) if (array[i]) response[i] = iterator.call(context, array[i], i, array);
      return response
    },
    bind: function(func, object) {
      if (typeof object == "undefined") return func;
      return function() {
        return func.apply(object, arguments)
      };
    },
    curry: function(func) {
      if (arguments.length == 1) return func;
      var args = toArray(arguments).slice(1);
      return function() {
        return func.apply(this, args.concat(toArray(arguments)))
      }
    },
    wrap: function(func, wrapper) {
      return function() {
        return wrapper.apply(this, [ActiveSupport.bind(func, this)].concat(toArray(arguments)))
      }
    },
    underscore: function(str) {
      return str.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, function (match) {
        match = match.split("");
        return match[0] + "_" + match[1]
      }).replace(/([a-z\d])([A-Z])/g, function (match) {
        match = match.split("");
        return match[0] + "_" + match[1]
      }).replace(/-/g, "_").toLowerCase()
    },
    camelize: function(str, capitalize) {
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
    extend: function(destination, source) {
      for (var property in source) destination[property] = source[property];
      return destination
    },
    clone: function(object) {
      return ActiveSupport.extend({}, object)
    }
  };

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
    ordinalize: function(number) {
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
    pluralize: function(word) {
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
    singularize: function(word) {
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

  return ActiveSupport;
}
