/**
 * HTTP Request
 *
 * This library abstracts the HTTP request interface exposing getter methods for URL, query string,
 * headers (user agent, cache-control, etc), form/post data, and uploads.
 *
 * Requires: core, lib_globals, lib_util, lib_server
 * Optional: lib_json
 *
 */

function lib_request() {
	var util = require('util');

	var url
		, url_parts
		, params
		, headers
		, cookies
		, postdata;
	
	var req;
	return req = {
		url: function(part){
			if (part) {
				if (!url_parts) url_parts = server.req.getURLParts();
				return url_parts[part];
			} else {
				if (!url) url = server.req.getURL();
				return url;
			}
		},
		headers: function(n){
			if (!headers) headers = server.req.getHeaders();
			if (n) {
				return headers.exists(n) ? headers(n) : '';
			} else {
				return headers;
			}
		},
		cookies: function(n){
			if (!cookies) cookies = server.req.getCookies();
			if (n) {
				return cookies.exists(n) ? cookies(n) : '';
			} else {
				return cookies;
			}
		},
		method: function(s){
			var r;
			if (req.headers('content-type')) {
				r = 'POST';
			} else {
				r = 'GET';
			}
			return (vartype(s) == 'string') ? (s.toUpperCase() == r) : r;
		},
		params: function(n) {
			if (!params) {
				params = util.parseQueryString(req.url('qs'));
				params = util.newParamCollection(params);
			}
			if (n) {
				return params.exists(n) ? params(n) : '';
			} else {
				return params;
			}
		},
		uploads: function(n) {
			if (!postdata) postdata = server.req.getPostData();
			if (!postdata.files) return null;
			if (n) {
				return postdata.files.exists(n) ? postdata.files(n) : null;
			} else {
				return postdata.files;
			}
		},
		post: function(n) {
			if (!postdata) postdata = server.req.getPostData();
			if (n) {
				return postdata.fields.exists(n) ? postdata.fields(n) : '';
			} else {
				return postdata.fields;
			}
		}
	};

}
