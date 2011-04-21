var spawn = require('child_process').spawn;
var app_vars = {};

var REG_MPBOUND = /;\s+boundary=(.*)$/i;

function shellEnc(str) {
  return str.replace(/[^{}[\]]+/g, function(s){
    return encodeURI(s);
  })
  .replace(/\+/g, '%2B')
  .replace(/%20/g, '+')
  .replace(/%22/g, '`');
}

//function parseCharset(str) {
//  str = String(str).toLowerCase().replace(/-/g,'');
//  if (str.match(/^(utf8|ucs2)$/)) {
//    return str;
//  } else {
//    return 'ascii';
//  }
//}

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

exports.exec = function(scriptName) {

  function proxy(req_data, callback, errback) {
    var m, stderr_data = '', stdout_data = '';
    var child = spawn('cscript', ['//nologo', scriptName, shellEnc(JSON.stringify(req_data))]);
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data){
      stderr_data += data;
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data){
      stdout_data += data;
      if (m = stdout_data.match(/^<<(.*)>>$/)) {
        stdout_data = '';
        handleRPC(JSON.parse(m[1]), child.stdin);
      }
    });
    child.on('exit', function(){
      if (stderr_data) {
        return errback(stderr_data);
      }
      try {
        var obj = JSON.parse(stdout_data);
      } catch(e) {
        return errback(stdout_data);
      }
      callback(obj);
    });

  }

  function processRequest(req, res) {
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
        Object.keys(req.form.files).forEach(function(n){
          var files = req.form.files[n];
          if (!(files instanceof Array)) {
            files = [files];
          }
          files.forEach(function(file){
            var pos = file.path.indexOf('/app/data');
            if (~pos) file.path = file.path.substr(pos + 1);
          });
        });
        req_data.postdata.files = req.form.files;
      }
    }
    proxy(req_data, function(res_data) {
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

  return function(req, res) {
    if (req.form) {
      req.form.complete(function(err, fields, files){
        req.form.fields = fields;
        req.form.files = files;
        processRequest(req, res);
      });
    } else {
      processRequest(req, res);
    }
  };

};

