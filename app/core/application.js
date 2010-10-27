/**
 * Enumerate Application variables based on regular expression.
 * If second param is a function, perform that on each item.
 *
 */
function appvars(rex,fn) {
	var arr = [], obj = {};
	Enumerator.each(rs.Fields,function(i,key){
		var val = Application(key), matches = key.match(rex);
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
}

/**
 * Main Application Object.
 * Also serves as shorthand for calling various functions.
 *
 */
function app(n,val) {
	var args = toArray(arguments);
	//Shorthand for app.addRoute()
	if (vartype(args[0]) == 'regex' || args[0].match(/^\//)) {
		return app.addroute('GET',args[0],args[1]);
	}
	//Shorthand for app.vars()
	if (vartype(args[0]) == 'string' && (args.length == 1 || args.length == 2)) {
		return app.vars.apply(this,args);
	}
}

/**
 * Get / Set Application Variable(s).
 *
 */
app.vars = function(n,val){
	var vars = new Collection(), json;
	appvars(/^JScript_(\w+)$/i,function(key,val,n){
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
 * Attach an Application event handler.
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
 * Execute an Application event.
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

/**
 * Request Routing is attached to app object.
 *
 */
Object.append(app,{
	routes: [],
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
	parseroute: function(route,fn) {
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
	},
	addroute: function(verb,a,b){
		var type = vartype(a);
		verb = (verb.toUpperCase() == 'POST') ? 'POST' : 'GET';
		if (type == 'string' && a.match(/[:\*]/)) {
			app.routes.push([verb].append(app.parseroute(a,b)));
		} else
		if (type == 'string' || type == 'regexp') {
			app.routes.push([verb,a,b]);
		} else {
			throw new Error('Route Must be String or RegExp.');
		}
	},
	process: function() {
		var url = req.url.base, method = req.method();
		app.routes.each(function(i,arr){
			if (arr[0] == method)
			if (vartype(arr[1]) == 'regexp') {
				var matches = arr[1].exec(url);
				if (matches) arr[2](matches.slice(1));
			} else
			if (vartype(arr[1]) == 'string') {
				if (url == arr[1]) arr[2]();
			}
		});
		app.notfound();
	},
	notfound: function(s){
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
});

/**
 * Process routes when application main() is complete.
 *
 */
app.on('complete',function(){
	app.process();
});
