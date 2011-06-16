/*!
 * Core Application Functionality
 *
 * This file should be included before any application code is executed.
 *
 */

var __approot = '/app/', __date = new Date();

/*!
 * Declare global variables
 * NOTE: Comment out for compatibility with CommonJS (becomes implied globals)
 */
var global, server, app, sys, req, res;

/**
 * Dispatch Request
 *
 * This function is called from dispatch.asp and executes a controller stub based on requested
 * URL. In cases where the controller file does not exist, it will call a function to rebuild
 * the required file(s).
 *
 * @param map {Object} Maps one or more URL prefix to controller
 */
function dispatch(map) {
  global = lib('globals');
  server = lib('server');
  req = server.req;
  res = server.res;
  res.clear();
  var path = req.getURLParts().path;
  forEach(map, function(key, controller) {
    var re, name = controller.controller || String(controller);
    if (key.match(/\/$/)) {
      re = new RegExp('^' + RegExp.escape(key), 'i');
    } else {
      re = new RegExp('^' + RegExp.escape(key) + '(/|$)', 'i');
    }
    if (path.match(re)) {
      var script = __approot + 'build/' + name + '.asp';
      try {
        server.exec(script);
      } catch(e) {
        if (/(execute failed|could not be opened)/i.test(e.message)) {
          buildControllerStubs(map);
          server.exec(script);
        } else {
          throw e;
        }
      }
    }
  });
  res.headers('content-type', 'text/plain');
  res.write('ERROR: No Route for ' + path);
  res.end();
}

/**
 * Initialize Application Environment and Route Request
 *
 * Initializes globals required by the application environment and dispatches request using the
 * event model. This requires most of the core libraries.
 *
 * Once the application environment has been initialized, the 'ready' event is triggered and request
 * routing begins. All application logic should have been bound to events by the time this function
 * is executed.
 *
 */
function app_init() {
  global = lib('globals');
  server = lib('server');
  app = lib('application');
  sys = app.sys = lib('system');
  req = app.req = lib('request');
  res = app.res = lib('response');
  req.router = lib('router');
  app.model = lib('model');
  app.util = lib('util');
  res.clear();
  trigger('ready');
  trigger('route');
  res.end();
}


/**
 * Load a library
 *
 * Libraries exist as special loader modules (functions prefixed with "lib_") that are executed to
 * create the library's instance (which can be of any data type). A library's loader function is
 * not executed until the first call to lib() and it is never executed twice. If an instance has
 * been previously created then a cached copy is returned (similar to require() in CommonJS).
 *
 * @param name {String}
 */
function lib(name) {
  var cache = lib.cache || (lib.cache = {}), instance = cache[name];
  if (instance) {
    return instance;
  }
  var module = this['lib_' + name];
  if (module) {
    var exports = {};
    var r = module.call(exports, exports) || exports;
    instance = cache[name] = r;
  }
  return instance;
}


/**
 * Bind an Application Event Handler
 *
 * Accepts a function which is added to the list of functions to be executed when the event is
 * triggered. Prepend "!" to the event name to add the function to the *top* of the list.
 *
 * NOTE: This is the only function that is called before app_init or dispatch. Therefore it does not
 * have access to functions/extensions that are created inside lib_global.
 *
 * @param name {String} Event Name
 * @param func {Function} Function to be bound to event
 */
function bind(name, func) {
  var events = bind.events || (bind.events = {});
  var priority = /^!/, top = false;
  if (priority.test(name)) {
    name = name.replace(priority, '');
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
 *
 * Accepts an object which will become the "this" context of each handler
 * and an array of arguments to be passed to each handler.
 *
 * @param name {String} Event Name
 * @param [data] {Object} Context Object
 * @param [args] {Array} Arguments
 */
function trigger(name, data, args) {
  var stack = trigger.stack || (trigger.stack = [])
    , events = bind.events || {};
  if (stack.exists(name)) {
    //Already within this event
    return data;
  }
  data = data || {};
  if (events[name]) {
    stack.push(name);
    events[name].each(function(i, event) {
      event.apply(data, args || [])
    });
    stack.pop();
  }
  return data;
}

/**
 * Function to output a stack trace
 *
 */
function stackTrace(fn) {
  if (!fn) fn = arguments.caller.callee;
  var list = [];
  while (fn && list.length < 10) {
    list.push(fn);
    fn = fn.caller;
  }
  list = list.map(function(fn) {
    return '' + fn;
  });
  res.die(list.join('\r\n\r\n'));
}

/*!
 * Compatibility with CommonJS
 */
if (typeof exports != 'undefined') {
  exports.dispatch = dispatch;
  exports.app_init = app_init;
  exports.lib = lib;
  exports.bind = bind;
  exports.trigger = trigger;
  exports.stackTrace = stackTrace;
}
