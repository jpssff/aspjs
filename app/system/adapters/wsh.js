/**
 * Windows Scripting Host Adapter
 *
 * This library is a wrapper so that the entire framework can be run from Windows Scripting Host
 * (WSH). This is useful when using a development webserver that will take the HTTP request and pass
 * it over the command line to WSH.
 *
 * Requires: core, lib_globals, Collection
 * Optional: lib_json, Binary
 *
 */
function lib_server() {

  var util = require('util');
  var json = require('json');
  var REG_URL = /^([^?]*)(\?|$)(.*)/;

  var wsh = global['WScript'];
  var args = wsh.arguments;
  if (args.length != 1) {
    throw new Error('Invalid Command Line Arguments');
  }
  var req_json = urlDec(args(0).replace(/`/g, '"'));
  var req_data = json.parse(req_json);

  var vars = {
    ipaddr: req_data.ipaddr,
    server: req_data.server,
    platform: 'Windows Scripting Host ' + wsh.version
  };

  var res = newResponse();

  function commitResponse() {
    var ctype = res.headers('content-type');
    res.headers('content-type', applyCharset(ctype, res.charset));
    var cookies = {};
    res.cookies.each(function(n,obj){
      if (vartype(obj) == 'string') {
        obj = {val:obj};
      }
      if (obj.exp) {
        obj.exp = Date.fromString(obj.exp);
      }
      cookies[n] = obj;
    });
    res.cookies = cookies;
    res.body = res.body.join('');
    wsh.stdout.write(shellEnc(json.stringify(res,true)));
  }

  function applyCharset(ctype, charset) {
    return (/^text\//i.exec(ctype)) ? ctype + '; charset=' + charset : ctype;
  }

  function encodeMessage(msg) {
    return '<<' + shellEnc(json.stringify(msg, true)) + '>>';
  }

  function shellEnc(str) {
    return str.replace(/[^{}[\]]+/g, function(s){
      return encodeURI(s);
    })
    .replace(/\+/g, '%2B')
    .replace(/%20/g, '+')
    .replace(/%22/g, '`');
  }

  function mapPath(s) {
    var p = wsh.scriptFullName;
    p = p.replace(/\\node\\.*$/, '\\');
    p = p + String(s).replace(/\//g, '\\');
    p = p.replace(/[\\]+/g, '\\');
    p = p.replace(/\\$/g, '');
    return p;
  }

  return {
    req: {
      getURL: function() {
        return req_data.url;
      },
      getURLParts: function() {
        var m = req_data.url.match(REG_URL);
        return {path: urlDec(m[1]) || '/', qs: m[2] + m[3]};
      },
      getHeaders: function() {
        return util.newParamCollection(req_data.headers);
      },
      getPostData: function() {
        var postdata = req_data.postdata || {};
        var files = postdata.files && util.newParamCollection(postdata.files);
        if (files) {
          files.each(function(n,fd){
            files(n, processUploadedFile(fd));
          });
        }
        return {fields: util.newParamCollection(postdata.fields), files: files};
      },
      getCookies: function() {
        return new Collection(req_data.cookies);
      }
    },
    res: {
      headers: function(){
        return res.headers.apply(null,arguments);
      },
      cookies: function(){
        return res.cookies.apply(null,arguments);
      },
      charset: function(s) {
        if (arguments.length) {
          return res.charset = s;
        } else {
          return res.charset;
        }
      },
      status: function(s) {
        if (arguments.length) {
          return res.status = s;
        } else {
          return res.charset;
        }
      },
      debug: function(o) {
        wsh.stdout.write(encodeMessage({action: 'debug', value: o}));
        wsh.stdin.readLine();
      },
      clear: function() {
        res = newResponse();
      },
      write: function(s) {
        //res.body.push({data: s, encoding: 'utf8'});
        res.body.push(s);
      },
      writebin: function(b) {
        //TODO: Implement Binary Response
        //res.body.push({data: b.toString('hex'), encoding: 'hex'});
        throw new Error('Binary Response not implemented in WSH');
      },
      end: function() {
        commitResponse();
        wsh.quit();
      }
    },
    mappath: function(s) {
      return mapPath(s);
    },
    exec: function(s) {
      throw new Error('WSH Script Execution not Implemented');
    },
    vars: function(n) {
      return vars[n] || '';
    },
    appvars: fngetset({
      get: function(n) {
        var msg = {
          action: 'app_var_get',
          name: n
        };
        wsh.stdout.write(encodeMessage(msg));
        var val = wsh.stdin.readLine();
        try {
          val = json.parse(val);
        } catch(e) {}
        return val;
      },
      set: function(n,val) {
        var msg = {
          action: 'app_var_get',
          name: n,
          value: json.stringify(val,true)
        };
        wsh.stdout.write(encodeMessage(msg));
        wsh.stdin.readLine();
      }
    })
  };


  /**
   * Create new response data object with blank / default values
   *
   * @returns {Object} Object containing response data fields
   */
  function newResponse() {
    return {
      status: '200',
      headers: new Collection({'content-type': 'text/plain', 'cache-control': 'private'}),
      cookies: new Collection(),
      charset: 'utf-8',
      body: []
    };
  }

  /**
   * Return a new file description object containing the properties and methods expected by the
   * framework including image type and dimensions if applicable.
   *
   * @param {Object} f File properties object received from server
   */
  function processUploadedFile(f) {
    var file = new ActiveXObject("Persits.Upload").openFile(sys.mappath(f.path));
    var fd = Object.create({
      move: function(p) {
        //file.move(sys.mappath(p));
        sys.fs.moveFile(f.path, p);
      },
      discard: function() {
        //file.Delete();
        sys.fs.deleteFile(f.path);
      }
    });
    Object.append(fd,{
      name: f.name,
      path: f.path,
      mimetype: f.type,
      created: __date,
      modified: __date,
      size: f.size,
      hash: f.hash
    });
    if (file.imageType != 'UNKNOWN') {
      fd.imagetype = String(file.imageType).toLowerCase();
      fd.imagewidth = file.imageWidth;
      fd.imageheight = file.imageHeight;
    }
    return fd;
  }

}