/**
 * Response Object
 *
 * NOTES: The purpose of this class is to abstract the web server's Response
 *        object. It exposes functions to correctly handle HTTP status codes,
 *        cache-control, content-type and other response headers.
 *
 */

function lib_response() {
	var res = {}
		, headers = {};
	
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
	
	return res;
}
