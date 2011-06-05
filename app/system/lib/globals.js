/*!
 * Global Functions and Variables
 *
 */

//These will become shorthand for Object.vartype, Array.toArray, String.urlEnc, etc
var vartype, isPrimitive, isSet, toArray, urlEnc, urlDec, htmlEnc, htmlDec;

/**
 * Shorthand to iterate Array / Object
 *
 */
function forEach(o, fn) {
  if (o instanceof Array) {
    return Array.prototype.each.call(o, fn);
  } else {
    return Object.each(o, fn);
  }
}

/**
 * Function to output a stack trace
 *
 */
function stackTrace(fn) {
  if (!fn) fn = arguments.caller.callee;
  var list = [];
  while (fn && list.length < 10) {
    list.push(fn);
    fn = fn.caller;
  }
  list = list.map(function(fn) {
    return '' + fn;
  });
  res.die(list.length + '\r\n' + list.join('\r\n\r\n'));
}

/**
 * Set a global variable.
 *
 * @param n
 * @param [val]
 */
function setGlobal(n, val) {
  var args = toArray(arguments);
  if (args.length == 2) {
    if ((/^[a-z_$][0-9a-z_$]*$/i).test(n)) {
      eval(n + " = val");
    }
    return val;
  } else {
    var items = args[0] || {};
    forEach(items, function(n, val) {
      setGlobal(n, val);
    });
    return args[0];
  }
}

/**
 * Get a member of an object or set it if it doesn't exist
 * This basically replaces lines like:
 * # val = obj.prop || (obj.prop = default_val);
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {Object} default_val
 */
function getset(obj, prop, default_val) {
  if (!Object.exists(obj, prop)) {
    obj[prop] = default_val;
  }
  return obj[prop];
}

/**
 * Create a Getter/Setter Function
 * The function returned accepts one or two arguments and calls the get,
 * set, del or each function based on the number and type of args passed in.
 *
 * @param {Object} params Named Parameters (at minimum "get" and "set")
 * @param {Object} [context] Context (becomes "this" inside getter/setter functions)
 * @returns {Function} Getter/Setter Function
 */
function fngetset(params, context) {
  var get = params.get, set = params.set, del = params.del, each = params.each;

  function gettersetter(n, val) {
    var self = context || this, type = Object.vartype(n), len = arguments.length;
    if (each && type == 'function') {
      return each.call(self, n);
    }
    if (len == 1) {
      if (type == 'object') {
        return Object.each(n, gettersetter);
      } else {
        return get.call(self, n);
      }
    }
    if (del && val === null) {
      return del.call(self, n);
    }
    return set.call(self, n, val);
  }

  return gettersetter;
}

/**
 * Extend built-in objects
 *
 * Some of this code is inspired by or based on ECMAScript 5 and/or various open-source JavasScript
 * libraries.
 *
 */
if (!this.lib_globals) this.lib_globals = lib_globals;
function lib_globals() {

  var XML_ENTITIES = {'amp': 38, 'apos': 27, 'gt': 62, 'lt': 60, 'nbsp': 160, 'quot': 34};
  var HTML_ENTITIES = {'aacute': 225, 'acirc': 226, 'acute': 180, 'aelig': 230, 'agrave': 224,
    'alefsym': 8501, 'alpha': 945, 'amp': 38, 'and': 8743, 'ang': 8736, 'apos': 27, 'aring': 229,
    'asymp': 8776, 'atilde': 227, 'auml': 228, 'bdquo': 8222, 'beta': 946, 'brvbar': 166,
    'bull': 8226, 'cap': 8745, 'ccedil': 231, 'cedil': 184, 'cent': 162, 'chi': 967, 'circ': 710,
    'clubs': 9827, 'cong': 8773, 'copy': 169, 'crarr': 8629, 'cup': 8746, 'curren': 164,
    'dagger': 8225, 'darr': 8659, 'deg': 176, 'delta': 948, 'diams': 9830, 'divide': 247,
    'eacute': 233, 'ecirc': 234, 'egrave': 232, 'empty': 8709, 'emsp': 8195, 'ensp': 8194,
    'epsilon': 949, 'equiv': 8801, 'eta': 951, 'eth': 240, 'euml': 235, 'euro': 8364, 'exist': 8707,
    'fnof': 402, 'forall': 8704, 'frac12': 189, 'frac14': 188, 'frac34': 190, 'frasl': 8260,
    'gamma': 947, 'ge': 8805, 'gt': 62, 'harr': 8660, 'hearts': 9829, 'hellip': 8230, 'iacute': 237,
    'icirc': 238, 'iexcl': 161, 'igrave': 236, 'image': 8465, 'infin': 8734, 'int': 8747, 'iota': 953,
    'iquest': 191, 'isin': 8712, 'iuml': 239, 'kappa': 954, 'lambda': 955, 'lang': 9001, 'laquo': 171,
    'larr': 8656, 'lceil': 8968, 'ldquo': 8220, 'le': 8804, 'lfloor': 8970, 'lowast': 8727,
    'loz': 9674, 'lrm': 8206, 'lsaquo': 8249, 'lsquo': 8216, 'lt': 60, 'macr': 175, 'mdash': 8212,
    'micro': 181, 'middot': 183, 'minus': 8722, 'mu': 956, 'nabla': 8711, 'nbsp': 160, 'ndash': 8211,
    'ne': 8800, 'ni': 8715, 'not': 172, 'notin': 8713, 'nsub': 8836, 'ntilde': 241, 'nu': 957,
    'oacute': 243, 'ocirc': 244, 'oelig': 339, 'ograve': 242, 'oline': 8254, 'omega': 969,
    'omicron': 959, 'oplus': 8853, 'or': 8744, 'ordf': 170, 'ordm': 186, 'oslash': 248, 'otilde': 245,
    'otimes': 8855, 'ouml': 246, 'para': 182, 'part': 8706, 'permil': 8240, 'perp': 8869, 'phi': 966,
    'pi': 960, 'piv': 982, 'plusmn': 177, 'pound': 163, 'prime': 8243, 'prod': 8719, 'prop': 8733,
    'psi': 968, 'quot': 34, 'radic': 8730, 'rang': 9002, 'raquo': 187, 'rarr': 8658, 'rceil': 8969,
    'rdquo': 8221, 'real': 8476, 'reg': 174, 'rfloor': 8971, 'rho': 961, 'rlm': 8207, 'rsaquo': 8250,
    'rsquo': 8217, 'sbquo': 8218, 'scaron': 353, 'sdot': 8901, 'sect': 167, 'shy': 173, 'sigma': 963,
    'sigmaf': 962, 'sim': 8764, 'spades': 9824, 'sub': 8834, 'sube': 8838, 'sum': 8721, 'sup': 8835,
    'sup1': 185, 'sup2': 178, 'sup3': 179, 'supe': 8839, 'szlig': 223, 'tau': 964, 'there4': 8756,
    'theta': 952, 'thetasym': 977, 'thinsp': 8201, 'thorn': 254, 'tilde': 732, 'times': 215,
    'trade': 8482, 'uacute': 250, 'uarr': 8657, 'ucirc': 251, 'ugrave': 249, 'uml': 168, 'upsih': 978,
    'upsilon': 965, 'uuml': 252, 'weierp': 8472, 'xi': 958, 'yacute': 253, 'yen': 165, 'yuml': 376,
    'zeta': 950, 'zwj': 8205, 'zwnj': 8204};

  function getGlobal() {
    return this;
  }

  //Append properties from one or more objects into the first (overwriting)
  Object.append = function() {
    var ret, args = Array.toArray(arguments);
    for (var i=0; i<args.length; i++) {
      if (args[i] instanceof Object) {
        if (ret) {
          Object.each(args[i],function(n, val) {
            ret[n] = val;
          });
        } else {
          ret = args[i];
        }
      }
    }
    return ret;
  };
  //Recursively append objects such that sub-objects are cloned
  Object.combine = function() {
    var ret, args = Array.toArray(arguments);
    for (var i=0; i<args.length; i++) {
      if (args[i] instanceof Object) {
        if (ret) {
          Object.each(args[i],function(n, val) {
            if (Object.isPrimitive(val)) {
              ret[n] = val;
            } else
            if (Object.vartype(val, 'object')) {
              //TODO: valueOf
              if (Object.exists(ret, n)) {
                ret[n] = Object.combine(ret[n],val)
              } else {
                ret[n] = Object.combine({},val)
              }
            } else {
              //TODO: clone
              ret[n] = val;
            }
          });
        } else {
          ret = args[i];
        }
      }
    }
    return ret;
  };
  //Create a new object that "inherits" from another
  Object.create = function(obj) {
    function F() {}
    F.prototype = obj;
    return new F();
  };
  //Extend an object so it "inherits" from parent but contains the given properties as its own
  Object.extend = function(parent, ext) {
    var obj = Object.create(parent);
    if (ext instanceof Function) {
      Object.append(obj, ext.call(parent, parent));
    } else
    if (ext instanceof Object) {
      //Object.append(obj, {_super: parent})
      Object.append(obj, ext)
    }
    return obj;
  };
  Object.each = function(o, f) {
    var i = 0;
    for (var n in o) if (Object.exists(o, n)) if (f.call(o, n, o[n],(i++)) === false) break;
    return o;
  };
  Object.exists = function(o, n) {
    return Object.prototype.hasOwnProperty.call(o, n);
  };
  Object.isPrimitive = function(obj) {
    return Object.vartype(obj, 'boolean null number string undefined');
  };
  Object.isSet = function(obj) {
    return !(obj === null || obj === undefined);
  };
  Object.keys = function(o) {
    var a = [];
    Object.each(o, function(n) {
      a.push(n);
    });
    return a;
  };
  Object.remove = function(o, a) {
    var type = Object.vartype(a);
    if (type == 'array') {
      for (var i=0; i<a.length; i++) Object.remove(o, a[i]);
    } else
    if (type == 'string' && Object.exists(o, a)) {
      delete o[a];
    }
    return o;
  };
  Object.values = function(o) {
    var a = [];
    Object.each(o, function(n, val) {
      a.push(val);
    });
    return a;
  };
  Object.vartype = function(obj, /**String|Array=*/ list) {
    if (list) {
      list = (list instanceof Array) ? list : String(list).w();
      return list.exists(Object.vartype(obj));
    }
    var type = (obj === null) ? 'null' : typeof obj;
    if (obj instanceof Object) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }
    return (type == 'object') ? 'unknown' : type;
  };

  Array.prototype.each = function(fn) {
    var arr = this, len = arr.length;
    for (var i = 0; i < len; i++) {
      if (fn.call(arr, i, arr[i]) === false) break;
    }
    return arr;
  };
  if (!Array.prototype.forEach)
  Array.prototype.forEach = function (fn, context) {
    var arr = this, len = context.length;
    context = context || arr;
    for (var i = 0; i < len; i++) {
      if (i in arr) fn.call(context, arr[i], i, arr);
    }
  };
  if (!Array.prototype.indexOf)
  Array.prototype.indexOf = function(el, i) {
    var arr = this, len = arr.length;
    i = i || 0;
    if (i < 0) i = len + i;
    for (; i < len; i++) {
      if (arr[i] === el) return i;
    }
    return -1
  };
  Array.prototype.exists = function(el) {
    return (Array.prototype.indexOf.call(this, el) >= 0);
  };
  if (!Array.prototype.filter)
  Array.prototype.filter = function(fn) {
    var arr = [];
    Array.prototype.each.call(this, function(i, el) {
      if (fn(el, i)) arr.push(el);
    });
    return arr;
  };
  if (!Array.prototype.map)
  Array.prototype.map = function(fn) {
    var arr = [];
    Array.prototype.each.call(this, function(i, el) {
      arr.push(fn(el, i));
    });
    return arr;
  };
  if (!Array.prototype.reduce)
  Array.prototype.reduce = function(fn, init) {
    var arr = this, len = arr.length, out, i = 0;
    if (arguments.length >= 2) {
      out = init;
    } else {
      out = arr[i++];
    }
    while (i < len) {
      out = fn.call(arr, out, arr[i], i++, arr);
    }
    return out;
  };
  Array.toArray = function(obj) {
    var len = obj.length, arr = new Array(len);
    for (var i = 0; i < len; i++) {
      arr[i] = obj[i];
    }
    return arr;
  };

  Function.prototype.bind = function(obj) {
    var fn = this;
    return function() {
      return fn.apply(obj, arguments);
    };
  };
  Function.noop = function() {};
  
  Number.parse = function(s, /**Number=0*/ d) {
    var i = parseFloat(s);
    return isFinite(i) ? i : d || 0;
  };
  Number.parseInt = function(s, /**Number=0*/ d) {
    var i = parseInt(s, 10);
    return isFinite(i) ? i : d || 0;
  };
  Number.random = function(lower, upper) {
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
  };
  
  var _split = String.prototype.split;
  String.prototype.split = function(s, limit) {
    if (Object.vartype(s) !== 'regexp') {
      return _split.apply(this, arguments);
    }
    var str = String(this), out = [], lastLastIndex = 0, match, lastLength;
    if (arguments.length < 2 || +limit < 0) {
      limit = Infinity;
    } else {
      limit = Math.floor(+limit);
      if (!limit) {
        return [];
      }
    }
    s = RegExp.copyAsGlobal(s);
    while (match = s.exec(str)) {
      if (s.lastIndex > lastLastIndex) {
        out.push(str.slice(lastLastIndex, match.index));
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(out, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = s.lastIndex;
        if (out.length >= limit)
          break;
      }
      if (s.lastIndex === match.index)
        s.lastIndex++;
    }
    if (lastLastIndex === str.length) {
      if (!RegExp.prototype.test.call(s, '') || lastLength)
        out.push('');
    } else {
      out.push(str.slice(lastLastIndex));
    }
    return (out.length > limit) ? out.slice(0, limit) : out;
  };
  
  String.prototype.replaceAll = function(a, b) {
    if (arguments.length == 1) {
      var self = this;
      Object.each(a, function() {
        String.prototype.replaceAll.apply(self, arguments);
      });
      return self;
    }
    return String.prototype.replace.call(this, new RegExp(RegExp.escape(a), 'ig'), b);
  };
  String.prototype.trimLeft = function() {
    return String.prototype.replace.call(this, /^\s*/, '');
  };
  String.prototype.trimRight = function() {
    return String.prototype.replace.call(this, /\s*$/, '');
  };
  String.prototype.trim = function() {
    return String.prototype.replace.call(this, /^\s+|\s+$/g, '');
  };
  String.prototype.padLeft = function(n, s) {
    var r = String(this), len = r.length;
    return (len < n) ? new Array(n - len + 1).join(s) + r : r;
  };
  String.prototype.padRight = function(n, s) {
    var r = String(this), len = r.length;
    return (len < n) ? r + new Array(n - len + 1).join(s) : r;
  };
  String.prototype.startsWith = function(s) {
    var self = this, re = new RegExp('^' + RegExp.escape(s), 'i');
    return !!String(self).match(re);
  };
  String.prototype.endsWith = function(s) {
    var self = this, re = new RegExp(RegExp.escape(s) + '$', 'i');
    return !!String(self).match(re);
  };
  String.prototype.replaceHead = function(s1, s2) {
    var self = this, re = new RegExp('^' + RegExp.escape(s1), 'i');
    return String(self).replace(re, s2);
  };
  String.prototype.replaceTail = function(s1, s2) {
    var self = this, re = new RegExp(RegExp.escape(s1) + '$', 'i');
    return String(self).replace(re, s2);
  };
  String.prototype.w = function() {
    return String.prototype.split.call(this, /[,\s]+/);
  };

  String.parse = function(s) {
    return Object.isSet(s) ? String(s) : '';
  };
  String.repeat = function(s, n) {
    var a = new Array(n + 1);
    return a.join(s);
  };

  var re_urlEnc = /[^0-9a-f!$'()*,-.\/:;@[\\\]^_{|}~]+/ig;
  String.urlEnc = function(s) {
    return String(s).replace(re_urlEnc, function(s) {
      return encodeURIComponent(s);
    });
  };
  String.urlDec = function(s) {
    s = s.replace(/\+/g, ' ');
    try {
      app.trycount = (app.trycount || 0) + 1;
      return decodeURIComponent(s);
    } catch(e) {
      return unescape(s);
    }
  };
  
  String.htmlEnc = function(s, /**Boolean=true*/ attr) {
    s = String(s).replaceAll({'&': '&amp;', '>': '&gt;', '<': '&lt;', '\u00a0': '&nbsp;'});
    if (attr !== false) {
      s = s.replaceAll('"', '&quot;');
    }
    return s;
  };
  String.htmlDec = function(s) {
    s = String.parse(s);
    s = s.replace(/&([a-z]+);/ig, function(ent, n) {
      var i = HTML_ENTITIES[n.toLowerCase()];
      return (i) ? String.fromCharCode(i) : ent;
    });
    s = s.replace(/&#(\d+);/g, function(ent, n) {
      var i = parseInt(n, 10);
      return (i) ? String.fromCharCode(i) : ent;
    });
    return s;
  };
  
  Date.prototype.toGMTString = function() {
    var a = Date.prototype.toUTCString.call(this).split(' ');
    if (a[1].length == 1) a[1] = '0' + a[1];
    return a.join(' ').replace(/UTC$/i, 'GMT');
  };
  Date.prototype.add = function(parts) {
    var date = this;
    if (parts.years) {
      date.setYear(date.getFullYear() + Number.parseInt(parts.years));
    }
    if (parts.months) {
      date.setMonth(date.getMonth() + Number.parseInt(parts.months));
    }
    if (parts.days) {
      date.setDate(date.getDate() + Number.parseInt(parts.days));
    }
    if (parts.hours) {
      date.setHours(date.getHours() + Number.parseInt(parts.hours));
    }
    if (parts.minutes) {
      date.setMinutes(date.getMinutes() + Number.parseInt(parts.minutes));
    }
    if (parts.seconds) {
      date.setSeconds(date.getSeconds() + Number.parseInt(parts.seconds));
    }
    return date;
  };
  Date.today = function() {
    var date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  Date.now = function() {
    return new Date();
  };

  var REG_DATE_1 = /^(\d{4})-(\d{2})-(\d{2})\s*T?([\d:]+)(\.\d+)?($|[Z\s+-].*)$/i;
  var REG_DATE_2 = /(^|[^\d])(\d{4})-(\d{1,2})-(\d{1,2})($|[^\d])/;
  Date.fromString = function(str, /**String=*/ def) {
    if (str instanceof Date) {
      return new Date(str);
    }
    str = String(str);
    //ISO 8601 / JSON-style date: "2008-12-13T16:08:32Z"
    str = str.replace(REG_DATE_1, '$2/$3/$1 $4$6');
    //YYYY-M-D
    str = str.replace(REG_DATE_2, '$1$2/$3/$4$5');
    var i = Date.parse(str);
    if (isFinite(i)) {
      return new Date(i);
    }
    if (def) {
      return def;
    }
  };
  Date.fromUTCString = function(str, /**String=*/ def) {
    var d = Date.fromString(str, def);
    if (d) {
      return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(),
        d.getMinutes(), d.getSeconds(), d.valueOf() % 1000));
    }
  };
  Date.getParts = function(d, /**Boolean=false*/ utc) {
    var part = {
      yyyy: (utc) ? d.getUTCFullYear() : d.getFullYear(),
      moy: (utc) ? d.getUTCMonth() : d.getMonth(),
      d: (utc) ? d.getUTCDate() : d.getDate(),
      dow: (utc) ? d.getUTCDay() : d.getDay(),
      H: (utc) ? d.getUTCHours() : d.getHours(),
      n: (utc) ? d.getUTCMinutes() : d.getMinutes(),
      s: (utc) ? d.getUTCSeconds() : d.getSeconds()
    };
    part.yy = String(part.yyyy).substr(2);
    part.m = part.moy + 1;
    part.cc = 'January February March April May June July August September October November December'
      .w()[part.moy];
    part.c = part.cc ? part.cc.substr(0, 3) : '';
    part.ww = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.w()[part.dow];
    part.w = part.ww ? part.ww.substr(0, 3) : '';
    part.h = (part.H > 12 || part.H == 0) ? Math.abs(part.H - 12) : part.H;
    part.p = (part.H > 11) ? 'pm' : 'am';
    part.P = (part.H > 11) ? 'PM' : 'AM';
    'm d H h n s'.w().each(function(i, n) {
      part[n + n] = String(100 + part[n]).substring(1);
    });
    return function(n) {
      return String.parse(part[n]);
    };
  };
  Date.format = function(d, fmt, /**Boolean=false*/ utc) {
    var r, type = Object.vartype(d);
    if (type == 'date' || type == 'number') {
      d = new Date(d);
    } else {
      d = Date.fromString(d);
    }
    if (!d) return '';
    r = (fmt) ? String(fmt) : '{yyyy}/{mm}/{dd}';
    var part = Date.getParts(d, utc);
    r = r.replace(/\{(\w+)\}/g, function(str, n) {
      return part(n) || str;
    });
    return r;
  };
  RegExp.escape = function(s) {
    return String(s).replace(/([.?*+^$[\]\\(){}-])/g,'\\$1');
  };
  RegExp.copyAsGlobal = function (o) {
    var m = 'g' + ((o.ignoreCase) ? 'i' : '') + ((o.multiline) ? 'm' : '');
    return new RegExp(o.source,m);
  };

  //Shorthand Copies
  vartype = Object.vartype;
  isPrimitive = Object.isPrimitive;
  isSet = Object.isSet;
  toArray = Array.toArray;
  urlEnc = String.urlEnc;
  urlDec = String.urlDec;
  htmlEnc = String.htmlEnc;
  htmlDec = String.htmlDec;

  return getGlobal();
}

/*!
 * Compatibility for v8cgi
 */
if (typeof exports != 'undefined') {
  exports.forEach = forEach;
  exports.stackTrace = stackTrace;
  exports.getset = getset;
  exports.fngetset = fngetset;
}
