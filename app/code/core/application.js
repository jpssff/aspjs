/**
 * Application Object:
 *
 * NOTES: This class provides access to application-wide in-memory storage
 *        and eventing.
 *
 *        The eventing model is per-request but is attached to the application
 *        object because it is used on application init, where the request
 *        object is undefined.
 *
 */

function lib_application() {
	
	/**
	 * Wrapper function for quickly performing common
	 * tasks.
	 *
	 */
	function app() {
		var args = toArray(arguments)
			, type = vartype(args[0]);
		//Shorthand for req.router.addRoute()
		if (type == 'regex' || args[0].match(/^\//)) {
			return req.router.addRoute('GET',args[0],args[1]);
		}
		//Shorthand for app.vars()
		if (type == 'string' && (args.length == 1 || args.length == 2)) {
			return app.vars.apply(this,args);
		}
	}
	
	/**
	 * Wrapper function for getting, setting and enumerating
	 * application variables.
	 *
	 * Use Cases:
	 *   app.vars('name'); //Get variable by name
	 *   app.vars('name','value'); //Set variable
	 *   app.vars('name',null);    //Delete variable
	 *   app.vars(function(n,val){ ... }); //Enumerate
	 *
	 */
	app.vars = function(n,val) {
		var type = vartype(n)
			, args = toArray(arguments)
			, len  = args.length
			, vars = {};
		if (len == 1 && type == 'string') {
			return Application(n);
		}
		if (len == 2) {
			if (val === null) {
				val = Application(n);
				Application.Contents.Remove(n);
			} else {
				Application(n) = val;
			}
			return val;
		}
		var fn = n;
		if (type != 'function') {
			fn = function(n,val){
				vars[n] = val;
			};
		}
		Enumerator.each(Application.Contents,function(i,key){
			fn(key,Application(key));
		});
		return vars;
	};
	
	
	/**
	 * Enumerate application variables based on regular expression.
	 *
	 * Use Cases:
	 *   app.vars.match(/^a/i); //Get variables starting with 'a'
	 *   app.vars.match(/^a/i,function(n,val){ ... }); //Call function with each match
	 *
	 */
	app.vars.match = function(rex,fn){
		var arr = [], obj = {};
		app.vars(function(key,val){
			var matches = key.match(rex);
			if (matches) {
				arr.push([key,val].concat(matches.slice(1)));
				obj[key] = val;
			}
		});
		if (fn) {
			arr.each(function(i,arr){
				var val = fn.apply(this,arr);
				if (val === null) {
					Application.Contents.Remove(arr[0]);
				} else
				if (typeof val != 'undefined') {
					Application(arr[0]) = val
				}
			});
		} else {
			return obj;
		}
	};
	
	/**
	 * Get / Set Application Variable(s).
	 *
	 */
	app.vars.get = function(n){
		var val = app.vars('JScript_' + n)
			, json;
		if (val instanceof VBArray) {
			if (!json) json = require('json');
			if (val.dimensions() == 1 && val.ubound() == 1) {
				val = json.parse(val.getItem(0));
			}
		}
		return val;
	};
	app.vars.set = function(n,val){
		var json;
		if (isPrimitive(val)) {
			return app.vars('JScript_' + n,val);
		} else {
			json = require('json');
			return app.vars('JScript_' + n,Array.safeArray([json.stringify(val)]));
		}
	};
	
	
	app._vars = function(n,val){
		var vars = new Collection(), json;
		app.vars.match(/^JScript_(\w+)$/i,function(key,val,n){
			if (val instanceof VBArray) {
				if (!json) json = require('json');
				if (val.dimensions() == 1 && val.ubound() == 1)
				vars(n,json.parse(val.getItem(0)));
			} else {
				vars(n,val);
			}
		});
		vars.on('set',function(n,val){
			Application('JScript_' + n) = val;
		});
		if (args.length == 0) {
			return vars.valueOf();
		};
		if (args.length == 1) return vars(n);
		if (args.length == 2) return vars(n,val);
	};
	
	/**
	 * Get Configuration Option(s).
	 *
	 */
	app.cfg = function(n){
		var cfg = (global.appcfg) ? appcfg() : {};
		//TODO: Some logic to load "factory defaults"
		//  and override with user-defined values.
		if (arguments.length) {
			return Object.exists(cfg,n) ? cfg[n] : '';
		} else {
			return cfg;
		}
	};
	
	/**
	 * Attach a function to an event.
	 *
	 */
	app.on = function(name,fn){
		var rex = /^:(\w+)/, top = false;
		if (name.match(rex)) {
			name = name.replace(rex,'$1');
			top = true;
		}
		var events = getset(app,'__events',{});
		if (Object.exists(events,name)) {
			if (top) events[name].unshift(fn);
			else events[name].push(fn);
		} else {
			events[name] = [fn];
		}
	};
	
	/**
	 * Trigger an event by name.
	 *
	 */
	app.trigger = function(name){
		var events = getset(app,'__events',{});
		if (Object.exists(events,name)) {
			events[name].each(function(i,evt){
				evt.call(app)
			});
			Object.remove(events,name);
		}
	};

	return app;

}
