//System Modules
var fs = require('fs')
  , tty = require('tty')
  , path = require('path')
  , spawn = require('child_process').spawn;

require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname + '/support');

//Library Modules
var gateway = require('gateway');
var connect = require('connect');
var form = require('connect-form');

//Configuration
var listenPort = 3000;
var scriptEngine = 'wsh';
var logFile = fs.createWriteStream(__dirname + '/logs/http.log');

//Helper Functions
function getPath(p) {
  p = p || '';
  return path.join(__dirname, '..', p);
}

//Working Directory
process.chdir(__dirname);

//Setup HTTP Server
var server = connect(
  connect.logger({stream:logFile}),
  connect.cookieParser(),
  form({uploadDir: getPath('app/data/temp')}),
  //Static/Public Assets
  function(req, res, next) {
    console.log(req.method + ' ' + req.url);
    if (req.url.match(/^\/([^\/]+\/)*favicon\.ico(\?.*)?$/i)) {
      req.url = '/assets/favicon.ico';
    } else
    if (req.url.match(/^\/admin(\?.*)?$/i)) {
      req.url = '/static/admin/en/current/index.html';
    } else {
      req.url = req.url.replace(/^\/admin-api\/(.*)$/i, '/admin/$1');
	}
    if (req.url.match(/^\/(assets|static)\//i)) {
      connect.static(getPath())(req, res, next);
    } else {
      next();
    }
  },
  //Dispatch to Request Handler
  gateway.getHandler(scriptEngine),
  //Not Found
  function(req, res){
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 Not Found');
  }
);

console.log('Starting Dev Server. Press Ctrl+C to Quit.');

//Start HTTP Server
var done;
while (!done) {
  try {
    server.listen(listenPort);
    done = true;
  } catch(e) {
    if (e.message.match(/address already in use/i)) {
      listenPort ++;
    } else {
      throw e;
    }
  }
}

console.log('Listening on port ' + listenPort + ' ...');

//Catch Keystrokes
tty.setRawMode(true);
process.stdin.resume();
process.stdin.on('keypress', function(char, key) {
  if (key && key.ctrl && char == '\u001a') {
    var url = 'http://localhost:' + listenPort + '/';
    console.log('Launching ' + url);
    spawn('cmd', ['/C', 'start', url]);
  } else
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
});

console.log('Press Ctrl+Z to launch browser.');
