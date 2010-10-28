var global = this
	, __approot = Application("AppRoot")
	, __date = new Date()
	, __now = __date.valueOf();


/**
 * Extend built-in objects via prototyping. See
 * ptototypes.js for details.
 *
 */
prototypes();


/**
 * Quick access to common functions
 *
 */
var vartype = Object.vartype
	, isPrimitive = Object.isPrimitive
	, isSet = Object.isSet
	, toArray = Array.toArray;


/**
 * Load Application Object
 *
 */
var app = require('application');

/**
 * Load Request and Response Objects
 *
 */
var req = app.req = require('request');
var res = app.res = require('response');


/**
 * Load Request Router
 *
 */
req.router = require('router');



/**
 * Get a property from an object if it exists. If not, set it.
 *
 * @param  {object}   obj
 * @param  {string}   prop
 * @param  {mixed}    val
 * @return {mixed}
 */
function getset(obj,prop,val) {
	if (!isSet(obj[prop])) obj[prop] = val;
	return obj[prop];
}


/**
 * Create and return a Getter/Setter Function.
 *  The function returned accepts one or two params
 *  and calls the get, set or del function based on
 *  the number and type of params passed in.
 *
 * @param  {function}   get
 * @param  {function}   set
 * @param  {function}   del
 * @return {function}
 */
function fngetset(get,set,del) {
	var priv = {};
	return function(n,val){
		if (arguments.length == 1) return get.call(priv,n);
		if (del && val === null) return del.call(priv,n);
		return set.call(priv,n,val);
	}
}


/**
 * Register a Library (Class). Accepts a function which is evaluated to return a library.
 *
 * @param  {string}   name
 * @param  {function} func
 */
function register(name,func) {
	var list = getset(arguments.callee,'list',{})
		, args = toArray(arguments);
	if (args.length == 0) {
		return list;
	}
	if (list[name]) throw(new Error('Duplicate Library: ' + name));
	list[name] = func();
}


/**
 * Require a Library (Class). If the library is already registered (via register() then it
 * returns a saved copy. If the library exists as a function begining with lib_
 * then it executes that now and saves the result for next time it is require()d.
 *
 * @param  {string}   name
 * @return {mixed}
 */
function require(name) {
	var list = register(), lib = list[name];
	if (lib) return lib;
	lib = global['lib_' + name];
	if (lib) return list[name] = lib();
}


/**
 * Run a function in global context.
 *
 * (This function might be removed in future to
 *  reduce global variable polution)
 *
 * @param  {function}   fn
 * @return {mixed}
 */
function run(fn) {
	return fn.apply(global,Array.prototype.slice.call(arguments,1));
}


/**
 * Set one or more global variables. Called via
 * global.set()
 *
 * (This function might be removed in future to
 *  reduce global variable polution)
 *
 * @param  {mixed} 
 * @return {mixed}
 */
function set() {
	var args = Array.prototype.slice.call(arguments);
	if (args.length == 2) {
		var n = String(args[0]);
		if (n.match(/^[a-z_$][0-9a-z_$]*$/i)) eval(n + " = args[1]");
		return args[1];
	} else {
		var col = args[0] || {};
		for (var n in col) if (col.hasOwnProperty(n)) set(n,col[n]);
		return args[0];
	}
}
