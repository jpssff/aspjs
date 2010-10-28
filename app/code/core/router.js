/**
 * Request Router
 *
 * NOTES: Request routing parses and handles the requested URL. A route
 *        matches a particular URL patern to a function or controller 
 *        that should handle the request.
 *
 *        The method this framework uses for describing URL patterns is
 *        borrowed from Sinatra (Ruby). The general form is /path/:param
 *        which allows named parameters preceded by colon characters.
 *
 */

function lib_router() {
	
	var routes = [];
	
	/**
	 * Parse the given route, returning a regular expression.
	 *
	 * An empty array should be passed as placeholder for
	 * the key names.
	 *
	 * @param  {String} path
	 * @param  {Array} keys
	 * @return {RegExp}
	 */
	function parseRoute(route,fn) {
		var keys = [],
		str = route
		.concat('/?')
		.replace(/\/\(/g, '(?:/')
		.replace(/(\/)?(\.)?:(\w+)(\?)?/g, function(_,slash,format,key,optional){
			keys.push(key);
			slash = slash || '';
			return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + '([^/.]+))' + (optional || '');
		})
		.replace(/([\/.-])/g, '\\$1')
		.replace(/\*/g, '(.+)');
		var rex = new RegExp('^' + str + '$','i');
		return [rex,function(matches){
			var params = new Collection();
			Object.each(keys,function(i,str){ params(str,matches[i]); });
			fn(params);
		}];
	}
	
	var router = {
		addRoute: function(verb,a,b){
			var type = vartype(a);
			verb = (verb.toUpperCase() == 'POST') ? 'POST' : 'GET';
			if (type == 'string' && a.match(/[:\*]/)) {
				routes.push([verb].append(parseRoute(a,b)));
			} else
			if (type == 'string' || type == 'regexp') {
				routes.push([verb,a,b]);
			} else {
				throw new Error('Route Must be String or RegExp.');
			}
		},
		process: function() {
			var url = req.url.base, method = req.method();
			routes.each(function(i,arr){
				if (arr[0] == method)
				if (vartype(arr[1]) == 'regexp') {
					var matches = arr[1].exec(url);
					if (matches) arr[2](matches.slice(1));
				} else
				if (vartype(arr[1]) == 'string') {
					if (url == arr[1]) arr[2]();
				}
			});
			app.noRoute();
		},
		noRoute: function(s){
			res.clear();
			res.header('status','404');
			if (s) {
				res.write(s);
			} else {
				res.writeline('404 Not Found');
				res.writeline(req.url.base);
			}
			res.end();
		}
	};
	
	/**
	 * Process routes after ready event has been fired.
	 *
	 */
	app.on('complete',function(){
		router.process();
	});
	
	return router;
	
}
