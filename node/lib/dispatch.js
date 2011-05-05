//Load Modules
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;


//Private Variables
var cwd = process.cwd();
var base_path = path.join(__dirname, '../..');
var app_vars = {};
var REG_MPBOUND = /;\s+boundary=(.*)$/i;


//Init Tasks (Sync)
var m, dispatch_data = fs.readFileSync(path.join(base_path, 'dispatch.asp'), 'utf8');
if (m = dispatch_data.match(/dispatch\((\{[\s\S]*\})\);/)) {
  dispatch_data = JSON.parse(m[1]);
} else {
  throw new Error('Malformed Dispatch File.');
}


//Helper Functions
function getControllerScript(url) {
  return 'handler';
}

function shellEnc(str) {
  return str.replace(/[^{}[\]]+/g, function(s){
    return encodeURI(s);
  })
  .replace(/\+/g, '%2B')
  .replace(/%20/g, '+')
  .replace(/%22/g, '`');
}

function shellDec(str) {
  str = String(str).replace(/`/g, '"').replace(/\+/g,' ');
  try {
    return decodeURIComponent(str);
  } catch(e) {
    return unescape(str);
  }
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
      req.form.complete(function(err, fields, files){
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
  proxy(engine, req_data, function(res_data) {
    var body = new Buffer(String(res_data.body), 'utf8');
    res_data.headers['Content-Length'] = body.length;
    var status = res_data.status.match(/^(\d+)(\s+\w+)?$/);
    if (status) {
      res.writeHead(status[1], res_data.headers);
    } else {
      res.writeHead('200', res_data.headers);
    }
    res.end(body);
  }, function(err_data) {
    res.writeHead(500, {'Content-Type': 'text/plain', 'Cache-Control': 'private'});
    res.end(err_data, 'utf8');
  });
}

function proxy(engine, req_data, callback, errback) {
  var script = getControllerScript(req_data.url);
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
  child.stderr.on('data', function(data){
    stderr_data += data;
  });
  child.stdout.setEncoding('ascii');
  child.stdout.on('data', function(data){
    stdout_data += data;
    if (m = stdout_data.match(/^<<(.*)>>$/)) {
      stdout_data = '';
      handleRPC(JSON.parse(shellDec(m[1])), child.stdin);
    }
  });
  child.on('exit', function(){
    if (stderr_data && !stderr_data.match(/^null\s*$/)) {
      return errback(stderr_data);
    }
    try {
      var obj = JSON.parse(shellDec(stdout_data));
    } catch(e) {
      return errback(stdout_data);
    }
    callback(obj);
  });

}

//Exports
exports.getHandler = getHandler;

