/**
 * v8cgi Command Line Adapter
 *
 * Requires: core, lib_globals, Collection
 * Optional: lib_json, Binary
 *
 */
if (!this.lib_server) this.lib_server = lib_server;
function lib_server() {

  var util = lib('util');
  var json = lib('json');
  var REG_URL = /^([^?]*)(\?|$)(.*)/;

  var args = system.args;
  if (args.length != 2) {
    throw new Error('Invalid Command Line Arguments');
  }
  var req_json = urlDec(args[1].replace(/`/g, '"'));
  var req_data = json.parse(req_json);

  var vars = {
    ipaddr: req_data.ipaddr,
    server: req_data.server,
    platform: 'v8cgi cli v' + v8cgi.version
  };

  function readLine() {
    var result = '', ch = '';
    while (ch != '\n') {
      result += ch;
      ch = system.stdin(1);
    }
    return result.replace(/[\r\n]/g, '');
  }

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
    system.stdout(shellEnc(json.stringify(res,true)));
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
    var p = v8cgi.executableName;
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
        system.stdout(encodeMessage({action: 'debug', value: o}));
        readLine();
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
        exit();
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
        system.stdout(encodeMessage(msg));
        var val = readLine();
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
        system.stdout(encodeMessage(msg));
        readLine();
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
