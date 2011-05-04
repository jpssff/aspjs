/**
 * Templating Engine
 *
 * Based on normal-template from NitroJS project
 * http://github.com/gmosx/normal-template
 *
 * This module presents functions for reading, compiling and rendering templates (views). Template
 * files are stored within the views folder and usually have an html file extension,
 * but can be of any file type.
 *
 * There are three types of template files:
 * - Partials - blocks of text/markup that can be included from a template or sub-template
 * - Sub-Templates - files that specify a parent file and contain content for each region specified
 * by the parent
 * - Templates - files that do not have a parent, but may optionally include regions for use by
 * sub-templates
 *
 */
function lib_templ(exports) {
  
  var TOKEN_RE = new RegExp("(\{[\=\:\#\/].+?\})")
    , COMMAND_RE = new RegExp("^\{[\:\/\=]")
    , PATH_RE = /^[a-z_$][a-z0-9_$]*(?:[.\/][a-z_$][a-z0-9_$]*)*$/i;
  
  var xpath = function(path) {
    if (path == ".") {
      path = "";
    } else
    if (!PATH_RE.test(path)) {
      throw new Error("Invalid path '" + path + "'");
    }
    path = path.replace(/\./g, "/");
    return 'get(d,"' + path + '")';
  }
  
  var get = function(obj,path) {
    var val = obj
      , arr = String(path).split('/');
    for (var i=0; i<arr.length;i++) {
      var key = arr[i];
      if (key && val) {
        val = getValueOf(val[key]);
      }
    }
    return val;
  }
  
  var getValueOf = function(obj) {
    var type = vartype(obj);
    if (type == 'object' && obj.valueOf instanceof Function) {
      if (!obj.valueOf.toString().match(/\[native code\]/)) {
        return obj.valueOf();
      }
    }
    return obj;
  }
  
  var esc1 = /[\\"\x08\f\n\r\t]/g
    , esc2 = {'\\':'\\\\','\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"'}
    , esc3 = /[\x00-\x1f\x7f-\xff\u0100-\uffff]/g;
  
  var esc = function(o) {
    var s = String(o);
    s = s.replace(esc1,function(c){
      return esc2[c];
    });
    s = s.replace(esc3,function(c){
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    });
    return s;
  }
  
  /**
   * Code specific to server-side processing
   */
  var baseDir = '/views/'
    , defExt = '.' + app.cfg('template/defaults/ext')
    , defFlt = app.cfg('template/defaults/filter')
    , fso, cache = {};
  
  exports.load = function(path) {
    var src = ''
      , p = String(path).replaceHead('/','').replaceHead('views/','').toLowerCase();
    if (sys.path.member(p).indexOf('.') < 0) {
      p = p + defExt;
    }
    if (Object.exists(cache,p)) {
      return cache[p];
    }
    try {
      src = sys.readTextFile(baseDir + p);
    } catch(e) {
      throw new Error('Error Reading Template File: ' + path);
    }
    src = exports.applySyntax(src);
    src = exports.applyParent(src);
    return cache[p] = src;
  };
  
  var TEMPLATE_RE = /\{\#(template|t) (.*?)\}/;
  exports.getTemplatePath = function(str) {
    var match = str.match(TEMPLATE_RE);
    if (match) {    
      return match[2];
    } else {
      return false;
    }
  };
  
  var BLOCK_RE = /\{\#(def|define|d|region) (.*?)\}([\s\S]*?)\{\/\#(def|define|d|region)(.*?)\}/g;
  exports.extractRegions = function(str) {
    var regions = {};
    
    str = str.replace(BLOCK_RE, function(match, tag, key, value) {
      regions[key] = value;
    });
    
    return regions;
  };
  
  var re_tag1  = /<%--(.*?)--%>/gi
    , re_tag2s = /<%\s*(\w+)(\s+[\w\-\/.]+)*\s*%>/gi
    , re_tag2e = /<%\s*end\s+(\w+)\s*%>/gi
    , re_tag3  = /<%\s*=\s*([\w\-\/.]+)((\s+[\w\-\/.]+)*)\s*%>/gi
    , re_tag4s = /<%#(.*?)\s*%>/gi
    , re_tag4e = /<%#end\s+(.*?)\s*%>/gi;
  
  var repl = {
    'with':'select',
    'each':'reduce'
  };
  
  exports.applySyntax = function(src) {
    var s = String(src);
    s = s.replace(re_tag1, '{:!$1}');
    s = s.replace(re_tag2e,function($0,$1){
      return '{/:' + (repl[$1] || $1) + '}';
    });
    s = s.replace(re_tag2s,function($0,$1,$2){
      return '{:' + (repl[$1] || $1) + String.parse($2) + '}';
    });
    s = s.replace(re_tag3, '{=$1$2}');
    s = s.replace(re_tag4e,'{/#$1}');
    s = s.replace(re_tag4s,'{#$1}');
      
    //TODO: DW Syntax
    //< !--#include file="path/file" -- >
    // and rewrite to: {#include path/file}
    return s;
  };
  
  var DATA_TAG_RE = /\{#data\s+([\w\-\/.]+)[\s=]+"((""|[^"])+)"\s*\}/gi;
  exports.parseDataTags = function(src) {
    var s = String(src), data = this;
    s = s.replace(DATA_TAG_RE, function(tag,n,val){
      if (!Object.exists(data,n)) {
        data[n] = val.replaceAll('""','"');
      }
      return '';
    });
    return s;
  };
  
  var VALUE_RE = /\{=(.+?)\}/g;
  exports.applyParent = function(src) {
    var regions, dataTags = [], parent = exports.getTemplatePath(src);
    while (parent) {
      src.replace(DATA_TAG_RE, function(tag){
        dataTags.push(tag);
      });
      regions = exports.extractRegions(src);
      src = exports.load(parent);
      src = src.replace(VALUE_RE,function(tag,name){
        if (Object.exists(regions,name)) {
          return regions[name];
        } else {
          return tag;
        }
      });
      parent = exports.getTemplatePath(src);
    }
    src = dataTags.join('\r\n') + '\r\n' + src;
    return src;
  };
  
  var INCLUDE_RE = /\{#include (.*?)\}/g;
  exports.applyIncludes = function(src) {
    while (INCLUDE_RE.test(src)) {
      src = src.replace(INCLUDE_RE, function(match, path) {
        return exports.load(path);
      });
    }
    return src;
  };
  
  var DATE_RE = /\$\{date\((.*?)\)\}/g;
  exports.extraSubs = function(src) {
    src = src.replace(DATE_RE, function(tag, fmt) {
      if (fmt == 'yyyy') {
        return __date.getUTCFullYear();
      } else {
        return tag;
      }
    });
    return src;
  };
  
  
  /**
   * Template filters. Add your own to this dictionary.
   */
  exports.filters = {
    // used to stringify a value
    val: function(obj) { 
      var type = vartype(obj);
      if (type == 'date') {
        return Date.format(app.util.applyTimezone(obj),app.cfg('template/defaults/date_format'));
      } else {
        return String(obj);
      }
    },
    // used to override default filtering
    str: function(s) {
      return s;
    },
    lcase: function(s) { 
      return s.toLowerCase();
    },
    ucase: function(s) { 
      return s.toUpperCase();
    },
    yesno: function(o) {
      return (o) ? 'Yes' : 'No';
    },
    // currency (input is in cents)
    cur: function(i) {
      return '$' + Math.floor(i / 100) + '.' + String(100 + (i % 100)).substr(1);
    },
    strip: function(s) { 
      return s.replace(/<([^>]+)>/g, "");
    },
    html: function(s) {
      return s.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
    },
    attr: function(s) {
      return s.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    },
    uri: function(s) {
      return encodeURI(s);
    },
    url: function(s) {
      return urlEnc(s);
    },
    escape: function(s) {
      return escape(s).replace(/\+/g,'%2B');
    }
  }
  
  /**
   * Compile the template source into the template function.
   */
  exports.compile = function(src, options) {
    // u = undefined, v = curent value, d = cursor, a = reduced array, df = default filter, res = result
    var code = ['var u,v,a,d = data,res = [];'],
      stack = ["data"],
      nesting = [],
      tokens = src.split(TOKEN_RE);
    var filters, tag;
  
    if (options && options.filters) {
      filters = {};
      Object.append(filters,exports.filters);
      Object.append(filters,options.filters);
    } else {
      filters = exports.filters;
    }
    
    if (defFlt && filters[defFlt]) {
      filters.defaultfilter = filters[defFlt];
    }
  
    if (filters.defaultfilter) {
      code.push('var df = filters.defaultfilter, s = filters.val;');
    }
           
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      
      if (token == "") continue;
  
      if (token.match(COMMAND_RE)) {
        if (token.substr(1,1) == ":") { // open tag
          var parts = token.substring(2, token.length-1).split(" "),
            cmd = parts[0],
            arg = parts[1],
            val;
          
          switch (cmd) {
          case "if": // checks for undefined and boolean.
            nesting.push("if");
            val = xpath(arg);
            code.push('if (' + val + ') {');
            continue;          
  
          case "select":
          case "s":
            nesting.push("select");
            val = xpath(arg);
            code.push('d = ' + val + ';if (d !== u) {');
            stack.unshift(val.replace(/^d\./, stack[0] + "."));
            continue;          
          
          case "reduce":
          case "r":
            nesting.push("reduce");
            val = xpath(arg);
            var depth = stack.length;
            code.push('var a' + depth + ' = ' + val + ';if ((a' + depth + ' !== u) && (a' + depth + '.length > 0)) ');
            stack.unshift("a" + depth + "[i" + depth + "]");
            code.push('for (var i' + depth + ' = 0,l' + depth + ' = a' + depth + '.length; i' + depth + ' < l' + depth + '; i' + depth + '++) {d = a' + depth + '[i' + depth + '];');        
            continue;          
            
          case "else":
          case "e":
            tag = nesting.pop();
            if (tag) {
              code.push('} else {');
              nesting.push(tag);
            } else {
              throw new Error("Unbalanced 'else' tag");
            }
            continue;
  
          case "lb": // output left curly bracket '{'
            code.push('res.push("{");');
            continue;
  
          case "rb": // output right curly bracket '}'
            code.push('res.push("}");');
            continue;
  
          case "!": // comment
            continue;
          }
        } else if (token.substr(1,1) == "/") { // close tag
          if (token.substr(2,1) == ":") {
            var cmd = token.substring(3, token.length-1).split(" ")[0];
  
            switch (cmd) {
            case "if":
              tag = nesting.pop();
              if (tag == "if") {
                code.push('};');
              } else {
                throw new Error("Unbalanced 'if' close tag" + (tag ? ", expecting '" + tag + "' close tag" : ""));
              }
              continue;
  
            case "select":
            case "s":
              tag = nesting.pop();
              if (tag == "select") {
                stack.shift();
                code.push('};d = ' + stack[0] + ';');
              } else {
                throw new Error("Unbalanced 'select' close tag" + (tag ? ", expecting '" + tag + "' close tag" : ""));
              }
              continue;
  
            case "reduce":
            case "r":
              tag = nesting.pop();
              if (tag == "reduce") {
                stack.shift();
                code.push('};d = ' + stack[0] + ';');
              } else {
                throw new Error("Unbalanced 'reduce' close tag" + (tag ? ", expecting '" + tag + "' close tag" : ""));
              }
              continue;
            }
          }
        } else if (token.substr(1,1) == "=") { // interpolation
          var parts = token.substring(2, token.length-1).split(" "),
            pre = "", post = "";
          for (var j = 0; j < parts.length-1; j++) {
            pre += "filters." + parts[j] + "("; post += ")";
          }
          if (pre == "") {
            if (filters.defaultfilter) {
              pre = "df("; post = ")";
            }
          }
          code.push('v = ' + xpath(parts[j]) + ';if (v !== u) res.push(' + pre + 's(v)' + post +');');
          continue;
        }
      }
  
      // plain text
      code.push('res.push("' + esc(token) + '");');
    }  
  
    tag = nesting.pop();
    if (tag) {
      throw new Error("Unbalanced '" + tag + "' tag, is not closed");
    }
  
    code.push('return res.join("");');  
  
    var func = new Function("data", "filters", "get", code.join(""));
  
    return function(data) { return func(data, filters, get) };
    //return function(data) { return func.toString() };
  }
  
  var lib = {
    renderContent: function(content,data) {
      return exports.compile(content,data)(data);
    },
    compile: function(path,data) {
      var src = exports.load(path);
      src = exports.applyIncludes(src);
      src = exports.extraSubs(src);
      data = data || {};
      src = exports.parseDataTags.call(data,src);
      return exports.compile(src);
    },
    render: function(path, data) {
      var args = Array.toArray(arguments)
        , path = args.shift();
      var data = {};
      args.unshift(data);
      Object.append.apply(this,args);
      return lib.compile(path,data)(data);
    }
  };
  
  return lib;

}

