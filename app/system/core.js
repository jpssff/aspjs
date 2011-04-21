/*!
 * Declare global variables
 */
var __approot, __date, __now;
var global, server, app, sys, req, res;

/**
 * Initialize Application Environment
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

	global = require('globals');
	server = require('server');
	app = require('application');
	sys = app.sys = require('system');
	req = app.req = require('request');
	res = app.res = require('response');
	if (req) {
		req.router = require('router');
	}
	app.util = require('util');
	res.clear();
	trigger('ready');
	trigger('route');
	res.end();
}


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
 * @param {Function} fn
 */
function dispatch(fn) {
	global = require('globals');
	server = require('server');
	req = server.req;
	res = server.res;
	res.clear();
	fn(server, req, res);
	res.end();
}


/**
 * Require a Library. If the library is already registered (via register() then it
 * returns a saved copy. If the library exists as a function begining with lib_
 * then it executes that now and saves the result for next time it is required.
 *
 * @param {String} name
 * @returns {Object}
 */
function require(name) {
	var list = require.list || (require.list = {});
	var lib = list[name], exports;
	if (lib) {
		return lib;
	}
	lib = this['lib_' + name];
	if (lib) {
		var exports = {};
		var r = lib.call(exports,exports) || exports;
		return list[name] = r;
	}
}


/**
 * Register an Event Handler
 * Accepts a function which is added to the list of functions to be executed any time the event is
 * triggered. Prepend ":" to the event name to append the function to _top_ of the list.
 *
 * NOTE: This is the only function that is called before app_init or dispatch. Therefore it does not
 * have access to shorthand functions, extended object methods or global variables.
 *
 * @param {String} name Event Name
 * @param {Function} func Function to be executed when Event fires
 */
function register(name, func) {
	var events = register.events || (register.events = {});
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
	var events = register.events || {};
	data = data || {};
	if (Object.exists(events,name)) {
		events[name].each(function(i,event){
			event.apply(data,args || [])
		});
	}
	return data;
}
