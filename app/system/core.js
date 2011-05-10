/*!
 * Declare global variables
 */
var __approot, __date, __now;
var global, server, app, sys, req, res;

/**
 * Dispatch Request
 * This is a lighter-weight dispatch function similar to app_init, but requires fewer library files
 * to be included in the script calling this function and doesn't use the event model.
 *

 * Receives a function and calls it with the following parameters:
 * server: Server abstraction interface
 * req: Request object
 * res: Response object
 *
 * @param {Object} map
 */
function dispatch(map) {
  __approot = '/app/';
  global = lib('globals');
  server = lib('server');
  req = server.req;
  res = server.res;
  res.clear();
  forEach(map, function(key, script) {
    var re, path = req.getURLParts().path;
    if (key.match(/\/$/)) {
      re = new RegExp('^' + RegExp.escape(key), 'i');
    } else {
      re = new RegExp('^' + RegExp.escape(key) + '(/|$)', 'i');
    }
    if (path.match(re)) {
      server.exec(__approot + script);
    }
  });
  res.headers('content-type', 'text/plain');
  res.write('ERROR: No Route for ' + path);
  res.end();
}


/**
 * Initialize Application Environment and Trigger Request Routing
 *
 * Sets global variables required by the application environment and dispatches request using the
 * event model. This requires most of the core & library files to be included within the script
 * calling this function.
 *
 * After the application environment has been loaded, the 'ready' event is triggered and then request
 * routing begins via the 'route' event. All business logic should have been bound to one of these two
 * events by the time this code runs.
 *
 */
function app_init() {
  __approot = '/app/';
  __date = new Date();
  __now = __date.valueOf();

  global = lib('globals');
  server = lib('server');
  app = lib('application');
  sys = app.sys = lib('system');
  req = app.req = lib('request');
  res = app.res = lib('response');
  if (req) {
    req.router = lib('router');
  }
  app.util = lib('util');
  res.clear();
  trigger('ready');
  trigger('route');
  res.end();
}


/**
 * Load a library. Libraries exist as special loader functions (prefixed with "lib_") that are
 * executed to return the library's "module" which can be any non-primitive data type. A loader
 * function is not executed before the first call to lib() and it is never executed twice. If the
 * library has been loaded before then a saved copy of the module is returned.
 *
 * @param {String} name
 * @returns {Object}
 */
function lib(name) {
  var cache = lib.cache || (lib.cache = {});
  var module = cache[name];
  if (module) {
    return module;
  }
  module = this['lib_' + name];
  if (module) {
    var exports = {};
    var r = module.call(exports,exports) || exports;
    return cache[name] = r;
  }
}


/**
 * Bind an Application Event Handler
 * Accepts a function which is added to the list of functions to be executed any time the event is
 * triggered. Prepend ":" to the event name to append the function to _top_ of the list.
 *
 * NOTE: This is the only function that is called before app_init or dispatch. Therefore it does not
 * have access to shorthand functions, extended object methods or global variables.
 *
 * @param {String} name Event Name
 * @param {Function} func Function to be executed when Event fires
 */
function bind(name, func) {
  var events = bind.events || (bind.events = {});
  var rex = /^:(\w+)/, top = false;
  if (name.match(rex)) {
    name = name.replace(rex,'$1');
    top = true;
  }
  if (events[name]) {
    if (top) {
      events[name].unshift(func);
    } else {
      events[name].push(func);
    }
  } else {
    events[name] = [func];
  }
}

/**
 * Trigger an event by name
 * Accepts a data parameter which will be bound to the context of each handler function (accessible
 * as "this") and an array of arguments to be passed to each handler.
 *
 * @param {String} name Event Name
 * @param {Object} data Context Data
 * @param {Array} args Arguments
 */
function trigger(name, data, args){
  var events = bind.events || {};
  data = data || {};
  if (Object.exists(events,name)) {
    events[name].each(function(i,event){
      event.apply(data,args || [])
    });
  }
  return data;
}

/*!
 * Compatibility for v8cgi
 */
if (typeof exports != 'undefined') {
  exports.app_init = app_init;
  exports.dispatch = dispatch;
  exports.lib = lib;
  exports.bind = bind;
  exports.trigger = trigger;
}
