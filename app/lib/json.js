function lib_json() {
	
	function valueOf(obj) {
		if (obj === null || obj === undefined) return obj;
		if (typeof obj.valueOf === 'function') return obj.valueOf();
		return obj;
	}
	
	var fn_parse = (function () {
		var number = '(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)';
		var oneChar = '(?:[^\\0-\\x08\\x0a-\\x1f\"\\\\]|\\\\(?:[\"/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';
		var string = '(?:\"' + oneChar + '*\")';
	
		// Will match a value in a well-formed JSON file.
		// If the input is not well-formed, may match strangely, but not in an unsafe
		// way.
		// Since this only matches value tokens, it does not match whitespace, colons,
		// or commas.
		var jsonToken = new RegExp(
				'(?:false|true|null|[\\{\\}\\[\\]]'
				+ '|' + number
				+ '|' + string
				+ ')', 'g');
	
		// Matches escape sequences in a string literal
		var escapeSequence = new RegExp('\\\\(?:([^u])|u(.{4}))', 'g');
	
		// Decodes escape sequences in object literals
		var escapes = {
			'"': '"',
			'/': '/',
			'\\': '\\',
			'b': '\b',
			'f': '\f',
			'n': '\n',
			'r': '\r',
			't': '\t'
		};
		function unescapeOne(_, ch, hex) {
			return ch ? escapes[ch] : String.fromCharCode(parseInt(hex, 16));
		}
	
		// A non-falsy value that coerces to the empty string when used as a key.
		var EMPTY_STRING = new String('');
		var SLASH = '\\';
	
		// Constructor to use based on an open token.
		var firstTokenCtors = { '{': Object, '[': Array };
	
		var hop = Object.hasOwnProperty;
	
	
		return function (json, opt_reviver) {
			// Split into tokens
			var toks = json.match(jsonToken);
			// Construct the object to return
			var result;
			var tok = toks[0];
			var topLevelPrimitive = false;
			if ('{' === tok) {
				result = {};
			} else if ('[' === tok) {
				result = [];
			} else {
				// The RFC only allows arrays or objects at the top level, but the JSON.parse
				// defined by the EcmaScript 5 draft does allow strings, booleans, numbers, and null
				// at the top level.
				result = [];
				topLevelPrimitive = true;
			}
	
			// If undefined, the key in an object key/value record to use for the next
			// value parsed.
			var key;
			// Loop over remaining tokens maintaining a stack of uncompleted objects and
			// arrays.
			var stack = [result];
			for (var i = 1 - topLevelPrimitive, n = toks.length; i < n; ++i) {
				tok = toks[i];
	
				var cont;
				switch (tok.charCodeAt(0)) {
					default:  // sign or digit
						cont = stack[0];
						cont[key || cont.length] = +(tok);
						key = void 0;
						break;
					case 0x22:  // '"'
						tok = tok.substring(1, tok.length - 1);
						if (tok.indexOf(SLASH) !== -1) {
							tok = tok.replace(escapeSequence, unescapeOne);
						}
						cont = stack[0];
						if (!key) {
							if (cont instanceof Array) {
								key = cont.length;
							} else {
								key = tok || EMPTY_STRING;  // Use as key for next value seen.
								break;
							}
						}
						cont[key] = tok;
						key = void 0;
						break;
					case 0x5b:  // '['
						cont = stack[0];
						stack.unshift(cont[key || cont.length] = []);
						key = void 0;
						break;
					case 0x5d:  // ']'
						stack.shift();
						break;
					case 0x66:  // 'f'
						cont = stack[0];
						cont[key || cont.length] = false;
						key = void 0;
						break;
					case 0x6e:  // 'n'
						cont = stack[0];
						cont[key || cont.length] = null;
						key = void 0;
						break;
					case 0x74:  // 't'
						cont = stack[0];
						cont[key || cont.length] = true;
						key = void 0;
						break;
					case 0x7b:  // '{'
						cont = stack[0];
						stack.unshift(cont[key || cont.length] = {});
						key = void 0;
						break;
					case 0x7d:  // '}'
						stack.shift();
						break;
				}
			}
			// Fail if we've got an uncompleted object.
			if (topLevelPrimitive) {
				if (stack.length !== 1) { throw new Error(); }
				result = result[0];
			} else {
				if (stack.length) { throw new Error(); }
			}
	
			if (opt_reviver) {
				// Based on walk as implemented in http://www.json.org/json2.js
				var walk = function (holder, key) {
					var value = holder[key];
					if (value && typeof value === 'object') {
						var toDelete = null;
						for (var k in value) {
							if (hop.call(value, k) && value !== holder) {
								// Recurse to properties first.  This has the effect of causing
								// the reviver to be called on the object graph depth-first.
	
								// Since 'this' is bound to the holder of the property, the
								// reviver can access sibling properties of k including ones
								// that have not yet been revived.
	
								// The value returned by the reviver is used in place of the
								// current value of property k.
								// If it returns undefined then the property is deleted.
								var v = walk(value, k);
								if (v !== void 0) {
									value[k] = v;
								} else {
									// Deleting properties inside the loop has vaguely defined
									// semantics in ES3 and ES3.1.
									if (!toDelete) { toDelete = []; }
									toDelete.push(k);
								}
							}
						}
						if (toDelete) {
							for (var i = toDelete.length; --i >= 0;) {
								delete value[toDelete[i]];
							}
						}
					}
					return opt_reviver.call(holder, key, value);
				};
				result = walk({ '': result }, '');
			}
	
			return result;
		};
	})();
	
	function fn_escape(str) {
		var r = String(str), t = {'\\':'\\\\','\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"' :'\\"'};
		Object.each(t,function(n,v){ r = r.split(n).join(v); });
		var e = new RegExp('[\\x00-\\x1f\\x7f-\\xff\\u0100-\\uffff]','g');
		return e.test(r) ? r.replace(e,function(c){ return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4); }) : r;
	}
	
	function fn_stringify(o,c) {
		var s = '', t = vartype(o);
		if (t == 'array' || t == 'arguments') {
			for (var i=0,len=o.length;i<len;i++) s += ',' + fn_stringify(o[i]);
			if (s.length > 0) s = s.substr(1);
			s = '[' + s + ']';
		} else
		if (t == 'date') {
			if (c) s = '"' + Date.format(o,'{yyyy}-{mm}-{dd}T{hh}:{nn}:{ss}Z',true) + '"';
			else s = 'new Date(Date.UTC(' + o.getUTCFullYear() + ',' + o.getUTCMonth() + ',' + o.getUTCDate() + ',' + o.getUTCHours() + ',' + o.getUTCMinutes() + ',' + o.getUTCSeconds() + ',' + o.getUTCMilliseconds() + '))';
		} else
		if (t == 'NaN') {
			s = (c) ? 'null' : 'NaN';
		} else
		if (t == 'number' || t == 'boolean') {
			s = (c) ? '"' + o.toString() + '"' : o.toString();
		} else
		if (t == 'regexp') {
			var m = ((o.global) ? 'g' : '') + ((o.ignoreCase) ? 'i' : '') + ((o.multiline) ? 'm' : '');
			if (c) s = '"[object] [RegExp]"';
			else s = 'new RegExp(' + fn_stringify(o.source) + ',"' + m + '")';
		} else
		if (t == 'string') {
			s = '"' + fn_escape(o) + '"';
		} else
		if (t == 'function') {
			s = (c) ? '"[object] [Function]"' : o.toString();
		} else
		if (!isSet(o)) {
			s = 'null';
		} else {
			Object.each(o,function(n,v){
				s += ',"' + fn_escape(n) + '":'  + fn_stringify(v,c);
			});
			if (s.length > 0) s = s.substr(1);
			s = '{' + s + '}';
		}
		return s;
	}
	
	return {stringify:fn_stringify,parse:fn_parse};
	
}
