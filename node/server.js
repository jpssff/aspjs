//System Modules
var fs = require('fs');
var path = require('path');
require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname + '/support');

//Library Modules
var dispatch = require('dispatch');
var connect = require('connect');
var form = require('connect-form');

//Configuration
var scriptEngine = 'wsh';
var logFile = fs.createWriteStream(__dirname + '/logs/http.log');

//Helper Functions
function getPath(p) {
  p = p || '';
  return path.join(__dirname, '..', p);
}

//HTTP Server
connect(
  connect.logger({stream:logFile}),
  connect.cookieParser(),
  form({uploadDir: path.join(__dirname, '../app/data/temp')}),
  //Static/Public Assets
  function(req, res, next){
    console.log(req.method + ' ' + req.url);
    if (req.url.toLowerCase() == '/favicon.ico') {
      req.url = '/assets/favicon.ico';
    }
    if (req.url.match(/^\/assets\//i)) {
      connect.static(getPath('/'))(req, res, next);
    } else {
      next();
    }
  },
  //Dispatch to Request Handler
  dispatch.getHandler(scriptEngine),
  //Not Found
  function(req, res){
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 Not Found');
  }
).listen(3000);

console.log('Listening on port 3000 ...');
