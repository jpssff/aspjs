//Load Modules
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var utils = require('../support/connect/utils');


//Private Variables
var cwd = process.cwd();
var base_path = path.join(__dirname, '../..');
var app_vars = {};
var REG_MPBOUND = /;\s*boundary=(.*)$/i;


//Init Tasks (Sync)
var m, dispatch_data = fs.readFileSync(path.join(base_path, 'dispatch.asp'), 'utf8');
if (m = dispatch_data.match(/dispatch\((\{[\s\S]*\})\);/)) {
  dispatch_data = JSON.parse(m[1]);
} else {
  throw new Error('Malformed Dispatch File.');
}
buildControllerStubs(dispatch_data);

//Helper Functions
function buildControllerStubs(map) {
  var cfg = {};
  Object.keys(map).forEach(function(key) {
    var controller = map[key];
    var name = controller.controller || String(controller);
    if (!cfg[name]) cfg[name] = controller;
  });
  var p = path.join(__dirname, '../jscript');
  fs.readdirSync(p).forEach(function(n) {
    var file = path.join(__dirname, '../jscript', n);
    var stat = fs.statSync(file);
    if (stat.isFile() && !n.match(/^_/)) {
      fs.unlinkSync(file);
    }
  });
  var controllers = {}, stubs = {};
  var bp = path.join(base_path, 'app/controllers');
  fs.readdirSync(bp).forEach(function(n) {
    if (n.match(/^_/)) return;
    var list = controllers[n] = [], name = n.replace(/\.(.*?)$/, '');
    var cp = path.join(bp, n), stat = fs.statSync(cp);
    if (stat.isDirectory()) {
      fs.readdirSync(cp).forEach(function(f) {
        var stat = fs.statSync(path.join(cp, f));
        if (stat.isFile() && !f.match(/^_/)) {
          list.push(n + '/' + f);
        }
      });
    } else
    if (stat.isFile()) {
      list.push(n);
    }
    if (!stubs[name]) {
      buildControllerStub(name, list, cfg);
      stubs[name] = true;
    }
  });
  return stubs;
}

function buildControllerStub(name, controllers, cfg) {
  var self = buildControllerStub, scripts = [];
  ['system', 'shared', 'models'].forEach(function(n) {
    if (self[n]) return scripts = scripts.concat(self[n]);
    var list = [], contents = fs.readFileSync(path.join(base_path, 'app', n, '_inc.asp'), 'utf8');
    contents.replace(/<script.*?src="([^"]*)".*?><\/script>/g, function(tag, p) {
      tag = tag.replace(' runat="server"', '');
      tag = tag.replace(p, p.replace(/\//g, '\\'));
      tag = tag.replace('adapters\\asp.js', 'adapters\\wsh.js');
      tag = tag.replace('src="', 'src="..\\..\\app\\' + n + '\\');
      list.push(tag);
    });
    self[n] = list;
    scripts = scripts.concat(list);
  });
  if (cfg && cfg[name] && cfg[name].inc) {
    cfg[name].inc.split(/[,\s]+/).forEach(function(script) {
      scripts.push('<script language="javascript" src="..\\..\\app\\system\\lib\\' + script + '"><\/script>');
    });
  }
  var output = [];
  output.push('<?xml version="1.0" encoding="utf-8"?>');
  output.push('<package>');
  output.push('<job id="main">');
  output.push('<script language="javascript" src="..\\..\\app\\config\\config.js"></script>');
  output.push('<script language="javascript" src="..\\..\\app\\system\\config\\config.js"></script>');
  scripts.forEach(function(tag) {
    output.push(tag);
  });
  controllers.forEach(function(script) {
    output.push('<script language="javascript" src="..\\..\\app\\controllers\\' + script.replace(/\//g, '\\') + '"><\/script>');
  });
  output.push('<script language="javascript">app_init();</script>');
  output.push('</job>');
  output.push('</package>');
  fs.writeFileSync(path.join(__dirname, '../jscript', name + '.wsf'), output.join('\r\n'));
}

function getControllerScript(url) {
  var items = Object.keys(dispatch_data);
  for (var i = 0; i < items.length; i++) {
    var key = items[i], controller = dispatch_data[key];
    var re, name = controller.controller || String(controller);
    if (key.match(/\/$/)) {
      re = new RegExp('^' + key, 'i');
    } else {
      re = new RegExp('^' + key + '(/|$)', 'i');
    }
    if (url.match(re)) {
      return name;
    }
  }
  var controller = items['/'];
  return controller ? controller.controller || String(controller) : 'default';
}

function shellEnc(str) {
  return str.replace(/[^{}[\]]+/g, function(s) {
    return encodeURI(s);
  })
  .replace(/\+/g, '%2B')
  .replace(/%20/g, '+')
  .replace(/%22/g, '`');
}

function handleRPC(rpc, stream) {
  if (rpc.action == 'app_var_set') {
    app_vars[rpc.name] = rpc.value;
    stream.write('OK' + '\n');
  } else
  if (rpc.action == 'app_var_get') {
    stream.write(app_vars[rpc.name] + '\n');
  } else
  if (rpc.action == 'debug') {
    console.log(rpc.value);
    stream.write('OK' + '\n');
  }
}


//Request Processing Functions
function getHandler(engine) {
  return function(req, res) {
    if (req.form) {
      req.form.complete(function(err, fields, files) {
        req.form.fields = fields;
        req.form.files = files;
        processRequest(engine, req, res);
      });
    } else {
      processRequest(engine, req, res);
    }
  };
}

function processRequest(engine, req, res) {
  var req_data = {
    url: req.url,
    method: req.method,
    headers: req.headers,
    cookies: req.cookies,
    ipaddr: req.connection.remoteAddress,
    server: 'Node ' + process.version
  };
  if (req_data.headers['content-type']) {
    req_data.headers['content-type'] = req_data.headers['content-type'].replace(REG_MPBOUND, '');
  }
  if (req.form) {
    req_data.postdata = {};
    if (req.form.fields) {
      req_data.postdata.fields = req.form.fields;
    }
    if (req.form.files) {
      Object.keys(req.form.files).forEach(function(n) {
        var files = req.form.files[n];
        if (!(files instanceof Array)) {
          files = [files];
        }
        files.forEach(function(file) {
          file.path = file.path.replace(/^.*\/app\//, '');
        });
      });
      req_data.postdata.files = req.form.files;
    }
  }

  function writeHead(res_data) {
    var cookies = [];
    Object.keys(res_data.cookies).forEach(function(n) {
      var cookie = res_data.cookies[n];
      if (!cookie.path) cookie.path = '/';
      cookies.push(utils.serializeCookie(n, cookie.value, cookie));
    });
    if (cookies.length) {
      res_data.headers['set-cookie'] = (cookies.length == 1) ? cookies[0] : cookies;
    }
    var status = res_data.status.match(/^(\d+)(\s+\w+)?$/);
    if (status) {
      res.writeHead(status[1], res_data.headers);
    } else {
      res.writeHead('200', res_data.headers);
    }
  }

  function http500(err) {
    var err_data = err && err.message || 'Unspecified Error';
    res.writeHead(500, {'Content-Type': 'text/plain', 'Cache-Control': 'private'});
    res.end(err_data, 'utf8');
  }

  proxy(engine, req_data, function(res_data) {
    if (!res_data.headers['Date']) {
      res_data.headers['Date'] = new Date().toUTCString();
    }
    if (res_data.body.sendFile) {
      var file = res_data.body.sendFile.replace(/^\//, '');
      console.log('sendFile: ' + file);
      file = path.join(base_path, file);
      fs.stat(file, function(err, stat) {
        if (err) return http500(err);
        if (!stat.isFile()) {
          return http500(new Error('Cannot Transfer Directory'));
        }
        res_data.headers['Content-Length'] = stat.size;
        res_data.headers['Transfer-Encoding'] = 'chunked';
        writeHead(res_data);
        var stream = fs.createReadStream(file);
        stream.pipe(res);
      });
    } else {
      var byteCount = 0;
      res_data.body.forEach(function(chunk, i) {
        chunk = res_data.body[i] = new Buffer(chunk.data, chunk.encoding || res_data.encoding || 'utf8');
        byteCount += chunk.length;
      });
      res_data.headers['Content-Length'] = byteCount;
      writeHead(res_data);
      res_data.body.forEach(function(chunk, i) {
        res.write(chunk);
      });
      res.end();
    }
  }, http500);
}

function proxy(engine, req_data, callback, errback) {
  var script = getControllerScript(req_data.url);
  console.log('CONTROLLER: ' + script);
  var child, script_path, arg_data = shellEnc(JSON.stringify(req_data));
  process.chdir(path.join(__dirname, '..'));
  if (engine == 'wsh') {
    script_path = path.join('jscript', script + '.wsf').replace(/\//g, '\\');
    child = spawn('cscript', ['//nologo', script_path, arg_data]);
  } else {
    script_path = path.join('v8cgi/scripts', script + '.js').replace(/\//g, '\\');
    child = spawn('v8cgi/v8cgi', ['-c', 'v8cgi/v8cgi.conf', script_path, arg_data]);
  }
  process.chdir(cwd);
  var m, stderr_data = '', stdout_data = '';
  child.stderr.setEncoding('ascii');
  child.stderr.on('data', function(data) {
    stderr_data += data;
  });
  child.stdout.setEncoding('ascii');
  child.stdout.on('data', function(data) {
    stdout_data += data;
    if (m = stdout_data.match(/(.*)\n$/)) {
      stdout_data = '';
      handleRPC(JSON.parse(m[1]), child.stdin);
    }
  });
  child.on('exit', function() {
    if (stderr_data && !stderr_data.match(/^null\s*$/)) {
      return errback(new Error(stderr_data));
    }
    try {
      var obj = JSON.parse(stdout_data);
    } catch(e) {
      return errback(new Error(stderr_data));
    }
    callback(obj);
  });

}

//Exports
exports.getHandler = getHandler;

