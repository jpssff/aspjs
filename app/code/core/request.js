/**
 * Request Object
 *
 * NOTES: The purpose of this class is to abstract the web server's Request
 *        object. It exposes functions to correctly parse and handle URL,
 *        query string, form and post data, request headers (user agent,
 *        cache-control, etc), and binary uploads.
 *
 */

function lib_request() {
	var req = {}
		, headers
		, qs
		, post;
	
	function getHeaders(){
		headers = {};
		Request.ServerVariables("ALL_RAW").Item()
		.split(/[\r\n]+/)
		.each(function(i,n){
			var a = n.split(/: ?/);
			if (a.length = 2) headers[a[0].toLowerCase()] = a;
		});
	}
	
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
		if (!headers) getHeaders();
		var n = prop.toLowerCase();
		return (Object.exists(headers,n)) ? headers[n][1] : '';
	};
	
	req.method = function(s){
		var r = 'GET';
		if (req.header('Content-Type')) r = 'POST';
		if (req.header('Content-Type').indexOf('form-data') >= 0) r = 'UPLOAD';
		return (vartype(s) == 'string') ? (s.toUpperCase() == r) : r;
	};
	
	return req;
}
