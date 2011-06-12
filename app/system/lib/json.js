if (!this.lib_json) this.lib_json = lib_json;
function lib_json() {
  
  /* PRIVATE VARIABLES */
  
  var esc1 = /[\\"\x08\f\n\r\t]/g
    , esc2 = {'\\':'\\\\','"':'\\"','\b':'\\b','\f':'\\f','\n':'\\n','\r':'\\r','\t':'\\t'}
    , esc3 = /[\x00-\x1f\x7f-\xff\u0100-\uffff]/g;
  
  var rvalidchars = /^[\],:{}\s]*$/
    , rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g
    , rvalidtokens = /"[^"\\\n\r]*"|true|false|null|undefined|NaN|Infinity|-Infinity|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
    , rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
  
  
  /* JSON FUNCTIONS */
  
  function fn_Stringify(o, strict) {
    if (o instanceof Object && o.toJSON instanceof Function) {
      o =  o.toJSON();
    }
    var s = '', t = fn_typeOf(o);
    if (t == 'null' || t == 'unknown') {
      s = 'null';
    } else
    if (t == 'undefined') {
      if (!strict) s = 'undefined';
    } else
    if (t == 'boolean') {
      s = Boolean.prototype.toString.call(o);
    } else
    if (t == 'number') {
      if (strict && !isFinite(o)) {
        s = 'null';
      } else {
        s = Number.prototype.toString.call(o);
      }
    } else
    if (t == 'string') {
      s = '"' + fn_esc(o) + '"';
    } else
    if (t == 'array') {
      var a = [];
      fn_each(o,function(i,o){
        var s = fn_Stringify(o, strict);
        a.push(s.length ? s : 'null')
      });
      s = '[' + a.join(',') + ']';
    } else
    if (t == 'date') {
      if (strict) {
        s = '"' + fn_fDate(o) + '"';
      } else {
        s = 'new Date(Date.UTC(' + fn_parseDate(o).join(',') + '))';
      }
    } else
    if (t == 'regexp') {
      if (strict) {
        s = '{}';
      } else {
        var m = ((o.global) ? 'g' : '') + ((o.ignoreCase) ? 'i' : '') + ((o.multiline) ? 'm' : '');
        s = 'new RegExp(' + fn_Stringify(o.source, strict) + ',"' + m + '")';
      }
    } else
    if (o instanceof Function) {
      if (!strict) {
        s = Function.prototype.toString.call(o).replace(/function\s*\w*\s*\(\s*([\w, ]*)\s*\)\s*\{([\w\W]*)\}/gim,function(src,args,code){
          var items = []
            , args = args.split(/[,\s]+/);
          if (args.join('')) {
            fn_each(args,function(i,s){
              items.push(fn_Stringify(s, strict));
            });
          }
          items.push(fn_Stringify(code.replace(/^[\r\n]*/gm,'').replace(/[\r\n]*$/gm,''), strict));
          return 'new Function(' + items.join(',') + ')';
        });
      }
    } else {
      var a = [];
      fn_each(o,function(n,o){
        var s = fn_Stringify(o, strict);
        if (s.length) a.push('"' + fn_esc(n) + '":' + s);
      });
      s = '{' + a.join(',') + '}';
    }
    return s;
  }
  
  function fn_Parse(s, strict) {
    if (fn_typeOf(s) !== 'string' || !s) {
      return null;
    }
    // Make sure JSON string is safe ( based on http://www.json.org/js.html )
    var t = s;
    t = t.replace(rvalidescape,'@');
    if (!strict) {
      t = t.replace(/new RegExp\("([^"]*)", ?"(\w*)"\)/gim,'["$1","$2"]');
      t = t.replace(/new Date\(Date.UTC\(([\d, ]*)\)\)/gim,'[$1]');
      t = t.replace(/new Function\((("[^"]*"[, ]*)*)\)/gim,'[$1]');
    }
    t = t.replace(rvalidtokens,']');
    t = t.replace(rvalidbraces,'');
    if (rvalidchars.test(t)) {
      try {
        return (new Function('return ' + s))();
      } catch(e) {}
    }
    throw new Error('Invalid JSON: ' + s);
  }  
  
  
  /* HELPER FUNCTIONS */
  
  function fn_typeOf(obj) {
    var type = (obj === null) ? 'null' : typeof obj;
    if (obj instanceof Object) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }
    return (type == 'object') ? 'unknown' : type;
  }
  
  function fn_each(o, fn) {
    if (o instanceof Array) {
      for (var i = 0, l = o.length; i < l; i++) {
        if (fn.call(o, i, o[i]) === false) break;
      }
    } else {
      for (var n in o) {
        if (o.hasOwnProperty(n)) {
          if (fn.call(o, n, o[n]) === false) break;
        }
      }
    }
    return o;
  }
  
  function fn_esc(o) {
    var s = String(o);
    s = s.replace(esc1, function(c) {
      return esc2[c];
    });
    s = s.replace(esc3, function(c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    });
    return s;
  }
  
  function fn_parseDate(o) {
    var d, t = fn_typeOf(o);
    if (t == 'date') {
      d = o;
    } else
    if (t == 'number') {
      d = new Date(o);
    } else
    if (t == 'string') {
      var i = Date.parse(o);
      if (isFinite(i)) {
        d = new Date(i);
      }
    }
    if (d) {
      return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(),
        d.getUTCSeconds(), d.getUTCMilliseconds()];
    }
  }
  
  function fn_pad(s, l) {
    return (new Array(l + 1).join('0') + s).slice(0 - l);
  }
  
  function fn_fDate(d) {
    //{yyyy}-{mm}-{dd}T{HH}:{nn}:{ss}.{ms}Z
    var a = fn_parseDate(d);
    if (a) {
      return a[0] + '-' + fn_pad(a[1] + 1, 2) + '-' + fn_pad(a[2], 2) + 'T' + fn_pad(a[3], 2) + ':' +
        fn_pad(a[4], 2) + ':' + fn_pad(a[5], 2) + '.' + fn_pad(a[5], 3) + 'Z';
    }
  }
  

  return {
    stringify: fn_Stringify,
    parse: fn_Parse
  };
  
}
