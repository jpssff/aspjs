/**
 * Initialize Request and Response Objects for use with controller functions.
 *
 * NOTES: The purpose of this class is to abstract the proprietary IIS Request
 *        and Response objects, expose new functionality and correctly handle
 *        requested URL, QueryString params and response headers.
 *
 */

var req = {}, res = {};

(function(){
	var headers, qs, post;
	
	var fn_getheaders = function(){
		headers = {};
		Request.ServerVariables("ALL_RAW").Item()
		.split(/[\r\n]/)
		.each(function(i,n){
			var a = n.split(/: ?/);
			if (a.length = 2) headers[a[0].toLowerCase()] = a;
		});
	};
	
	req.url = (function(raw){
		var url = raw.replace(/(\d+;\w+\:\/\/[^\/]+)?\/?(.*)/i,'/$2')
			, rex = /^([^?&]*)(\?|&|$)(.*)/
			, base = url.replace(rex,'$1')
			, qs = url.replace(rex,'$3');
		var obj = (qs.length) ? new String(base + '?' + qs) : new String(base);
		obj.base = base;
		obj.qs = qs ? '?' + qs : '';
		return obj;
	})(Request.QueryString.Item());
	
	req.qs = (function(qs){
		var obj = {}, map = {};
		if (qs.length > 1) {
			qs.split(/[&\?]/).each(function(i,str){
				var arr = str.split('=').map(function(s){ return String.urlDec(s); });
				if (arr.length == 2) {
					map[arr[0]] = arr[1];
					obj[arr[0].toLowerCase()] = arr;
				}
			});
		}
		return function(prop){
			if (!prop) return map;
			var n = prop.toLowerCase();
			return (Object.exists(obj,n)) ? obj[n][1] : '';
		};
	})(req.url.qs);
	
	req.header = function(prop){
		if (!headers) fn_getheaders();
		var n = prop.toLowerCase();
		return (Object.exists(headers,n)) ? headers[n][1] : '';
	};
	
	req.method = function(s){
		var r = 'GET';
		if (req.header('Content-Type')) r = 'POST';
		if (req.header('Content-Type').indexOf('form-data') >= 0) r = 'UPLOAD';
		return (vartype(s) == 'string') ? (s.toUpperCase() == r) : r;
	};
	
})();

(function(){
	var headers = {};
	Object.append(res,{
		clear: function() {
			Response.Clear();
			if (arguments.length) Response.ContentType = arguments[0];
		},
		write: function(val) {
			Response.Write(String(val));
		},
		writeline: function(val) {
			res.write(String(val) + '\r\n');
		},
		end: function() {
			app.trigger('destroy');
			Response.End();
		},
		die: function(val,type) {
			res.clear();
			if (type) res.header('content-type',type);
			if (isPrimitive(val)) {
				res.write(val);
			} else {
				res.write(require('json').stringify(val));
			}
			res.end();
		},
		header: fngetset(function(prop){
			var n = prop.toLowerCase();
			if (headers[n]) return headers[n][1];
		},function(prop,val){
			var n = prop.toLowerCase(), val = String(val);
			if (n == 'status') {
				Response.Status = val;
			} else
			if (n == 'content-type') {
				Response.ContentType = val;
			} else
			if (n == 'cache-control') {
				Response.CacheControl = val;
			} else {
				Response.AddHeader(prop,val);
			}
			headers[n] = [prop,val];
		}),
		redirect: function(url,type){
			if (type == '301') {
				res.header('status','301 Moved Permanently');
				res.header('Location',url);
			} else
			if (type == '303') {
				res.header('status','303 See Other');
				res.header('Location',url);
			} else {
				res.header('status','302 Moved');
				res.header('Location',url);
			}
			res.end();
		}
	});
})();





