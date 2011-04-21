/**
 * Application Object:
 *
 * This class provides methods for accessing application configuration and shorthand for request
 * routing and in-memory application variables.
 *
 */

function lib_application() {

	var server = require('server'), req = require('request');

	/**
	 * Wrapper function for easy access to common tasks.
	 *
	 */
	function app() {
		var args = toArray(arguments)
			, type = vartype(args[0])
			, re_route = /^(?:([A-Z]+)\:)?(\/.*)$/
			, matches;
		//Shorthand for req.router.addRoute()
		if (type == 'regex' || (matches = args[0].match(re_route))) {
			var verb;
			if (matches) {
				verb = matches[1];
				args[0] = matches[2];
			}
			return req.router.addRoute(verb,args[0],args[1]);
		}
		//Shorthand for server.appvars()
		return server.appvars.apply(this,args);
	}
	
	/**
	 * Get config option(s) based on a cascading hierarchy of key-value
	 * sets. System config is overridden by Application config which is
	 * overridden by Database config, etc.
	 *
	 */
	app.cfg = function(n){
		if (!app.cfg.data) {
			var cfg = {}
				, syscfg = require('syscfg')
				, appcfg = require('appcfg');
			if (syscfg) {
				Object.combine(cfg,syscfg);
			}
			if (appcfg) {
				Object.combine(cfg,appcfg);
			}
			app.cfg.data = cfg;
		}
		if (!app.cfg.get) {
			app.cfg.get = app.util.xpath(app.cfg.data);
		}
		if (n) {
			return app.cfg.get(n);
		} else {
			return app.cfg.data;
		}
	};

	/*!
	 * QuickStore
	 * Simple interface to store / retrieve data using in-memory (app level) storage indexed by
	 * auto-generated numeric key.
	 *
	 */
	app.checkin = function(data){
		//Auto-generates 5-digit numeric key
		var key = Math.floor(Math.random() * 89999) + 10000;
		app('QuickStore:' + key, data);
		return key
	};
	
	app.checkout = function(key){
		//Data is erased at time of retrieval
		return app('QuickStore:' + key, null);
	};

	return app;
}
