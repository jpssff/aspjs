//System Modules
var fs = require('fs');
var path = require('path');
require.paths.unshift('./lib');
require.paths.unshift('./support');

//Library Modules
var dispatch = require('dispatch');
var connect = require('connect');
var form = require('connect-form');

var logfile = fs.createWriteStream(__dirname + '/logs/http.log');

function getPath(p) {
  p = p || '';
  return path.join(__dirname, '..', p);
}

connect(
  connect.logger({stream:logfile}),
  connect.cookieParser(),
  form({uploadDir: path.join(__dirname, '../app/data/temp')}),
  //Static/Public Assets
  function(req, res, next){
    console.log(req.method + ' ' + req.url);
    if (req.url.match(/^\/assets\//i)) {
      connect.static(getPath('/'))(req, res, next);
    } else {
      next();
    }
  },
  //Execute ASP Script
  dispatch.exec('jscript/handler.wsf'),
  //Not Found
  function(req, res){
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 Not Found');
  }
).listen(3000);

console.log('Listening on port 3000 ...');
