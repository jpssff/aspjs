/*!
 * Language Library
 *
 * Provides a number of methods for changing a word between singular and plural, changing between
 * camel-cased and underscored as well as stemming (reducing a word to its stem by removing the
 * commoner morphological and inflectional endings).
 *
 * Stemming function based on Porter stemming algorithm:
 *  Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14,
 *  no. 3, pp 130-137,
 *
 * see also http://www.tartarus.org/~martin/PorterStemmer
 *
 * Release 1 by 'andargor', Jul 2004
 * Release 2 (substantially revised) by Christopher McKenzie, Aug 2009
 */
if (!this.lib_lang) this.lib_lang = lib_lang;
function lib_lang() {
  var lang;

  lang = {
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
      var camelized, parts = str.replace(/\_/g, "-").split("-"), len = parts.length;
      if (len === 1) if (capitalize) return parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
      else return parts[0];
      if (str.charAt(0) === "-") camelized = parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
      else camelized = parts[0];
      for (var i = 1; i < len; i++) camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
      if (capitalize) return camelized.charAt(0).toUpperCase() + camelized.substring(1);
      else return camelized
    }
  };

  lang.inflector = {
    inflections: {
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
      for (i = 0; i < lang.inflector.inflections.uncountable.length; i++) {
        var uncountable = lang.inflector.inflections.uncountable[i];
        if (lc === uncountable) return word
      }
      for (i = 0; i < lang.inflector.inflections.irregular.length; i++) {
        var singular = lang.inflector.inflections.irregular[i][0];
        var plural = lang.inflector.inflections.irregular[i][1];
        if (lc === singular || lc === plural) return plural
      }
      for (i = 0; i < lang.inflector.inflections.plural.length; i++) {
        var regex = lang.inflector.inflections.plural[i][0];
        var replace_string = lang.inflector.inflections.plural[i][1];
        if (regex.test(word)) return word.replace(regex, replace_string)
      }
      return word
    },
    singularize: function(word) {
      var i, lc = word.toLowerCase();
      for (i = 0; i < lang.inflector.inflections.uncountable.length; i++) {
        var uncountable = lang.inflector.inflections.uncountable[i];
        if (lc === uncountable) return word
      }
      for (i = 0; i < lang.inflector.inflections.irregular.length; i++) {
        var singular = lang.inflector.inflections.irregular[i][0];
        var plural = lang.inflector.inflections.irregular[i][1];
        if (lc === singular || lc === plural) return singular
      }
      for (i = 0; i < lang.inflector.inflections.singular.length; i++) {
        var regex = lang.inflector.inflections.singular[i][0];
        var replace_string = lang.inflector.inflections.singular[i][1];
        if (regex.test(word)) return word.replace(regex, replace_string)
      }
      return word
    }
  };

  //Stemming Stuff
  var step2list = {"ational": "ate", "tional": "tion", "enci": "ence", "anci": "ance", "izer": "ize",
      "bli": "ble", "alli": "al", "entli": "ent", "eli": "e", "ousli": "ous", "ization": "ize",
      "ation": "ate", "ator": "ate", "alism": "al", "iveness": "ive", "fulness": "ful",
      "ousness": "ous", "aliti": "al", "iviti": "ive", "biliti": "ble", "logi": "log"};

  var step3list = {"icate": "ic", "ative": "", "alize": "al", "iciti": "ic", "ical": "ic",
      "ful": "", "ness": ""};

  var c = "[^aeiou]",       // consonant
      v = "[aeiouy]",       // vowel
      C = c + "[^aeiouy]*", // consonant sequence
      V = v + "[aeiou]*",   // vowel sequence
      mgr0 = "^(" + C + ")?" + V + C,                   // [C]VC... is m>0
      meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$", // [C]VC[V] is m=1
      mgr1 = "^(" + C + ")?" + V + C + V + C,           // [C]VCVC... is m>1
      s_v = "^(" + C + ")?" + v;                        // vowel in stem

  lang.stemmer = function(w) {
    var stem, suffix, firstch, re, re2, re3, re4, origword = w;

    if (w.length < 3) return w;

    firstch = w.substr(0,1);
    if (firstch == "y") {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = /^(.+?)(ss|i)es$/;
    re2 = /^(.+?)([^s])s$/;

    if (re.test(w)) {
      w = w.replace(re,"$1$2");
    } else
    if (re2.test(w)) {
      w = w.replace(re2,"$1$2");
    }

    // Step 1b
    re = /^(.+?)eed$/;
    re2 = /^(.+?)(ed|ing)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      re = new RegExp(mgr0);
      if (re.test(fp[1])) {
        re = /.$/;
        w = w.replace(re,"");
      }
    } else
    if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1];
      re2 = new RegExp(s_v);
      if (re2.test(stem)) {
        w = stem;
        re2 = /(at|bl|iz)$/;
        re3 = new RegExp("([^aeiouylsz])\\1$");
        re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        if (re2.test(w)) {
          w = w + "e";
        } else
        if (re3.test(w)) {
          re = /.$/;
          w = w.replace(re,"");
        } else
        if (re4.test(w)) {
          w = w + "e";
        }
      }
    }

    // Step 1c
    re = /^(.+?)y$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(s_v);
      if (re.test(stem)) w = stem + "i";
    }

    // Step 2
    re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step2list[suffix];
      }
    }

    // Step 3
    re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step3list[suffix];
      }
    }

    // Step 4
    re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
    re2 = /^(.+?)(s|t)(ion)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      if (re.test(stem)) {
        w = stem;
      }
    } else
    if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = new RegExp(mgr1);
      if (re2.test(stem)) {
        w = stem;
      }
    }

    // Step 5
    re = /^(.+?)e$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      re2 = new RegExp(meq1);
      re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
        w = stem;
      }
    }

    re = /ll$/;
    re2 = new RegExp(mgr1);
    if (re.test(w) && re2.test(w)) {
      re = /.$/;
      w = w.replace(re,"");
    }

    // and turn initial Y back to y
    if (firstch == "y") {
      w = firstch.toLowerCase() + w.substr(1);
    }

    return w;
  };

  return lang;
}
