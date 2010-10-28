/**
 * Extend built-in objects. This is a special library that gets
 * called explicitly from globals.js before program code is executed.
 *
 * Many of the following functions are part of newer JavaScript (ECMA)
 * standards and/or part of common JS libraries (jQuery, etc).
 *
 */
function prototypes() {
	
	Object.append = function(self,o) {
		Object.each(o,function(n,val){ self[n] = val; });
		return self;
	};
	Object.create = function(obj) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
	Object.each = function(o,f) {
		var i = 0;
		for (var n in o) if (Object.exists(o,n)) if (f.call(o,n,o[n],(i++)) === false) break;
		return o;
	};
	Object.exists = function(o,n) {
		return Object.prototype.hasOwnProperty.call(o,n);
	};
	Object.isPrimitive = function(obj) {
		return 'boolean,null,number,string,undefined'.split(',').exists(Object.vartype(obj));
	};
	Object.isSet = function(obj) {
		return !(obj === null || obj === undefined);
	};
	Object.keys = function(o) {
		var a = [];
		Object.each(o,function(n){ a.push(n); });
		return a;
	};
	Object.remove = function(o,a) {
		var type = Object.vartype(a);
		if (type == 'array') {
			for (var i=0;i<a.length;i++) Object.remove(o,a[i]);
		} else
		if (type == 'string' && Object.exists(a)) {
			delete o[a[i]];
		}
		return o;
	};
	Object.values = function(o) {
		var a = [];
		Object.each(o,function(n,val){ a.push(val); });
		return a;
	};
	Object.vartype = function(obj) {
		if (obj === null) return 'null';
		var type = typeof obj;
		if (obj instanceof Object) {
			var arr = (/\[object (\w+)\]/).exec(Object.prototype.toString.call(obj));
			if (arr) type = arr[1].toLowerCase();
			return type;
		}
		return (type == 'object') ? 'unknown' : type;
	};
	
	Array.prototype.each = function(f) {
		var a = this;
		for (var i=0,len=a.length;i<len;i++) if (f.call(a,i,a[i]) === false) break;
		return a;
	};
	Array.prototype.indexOf = function(obj) {
		var a = this;
		for (var i=0,len=a.length;i<len;i++) if (a[i] === obj) return i;
		return -1;
	};
	Array.prototype.exists = function(obj) {
		var a = this;
		return ( Array.prototype.indexOf.call(a,obj) >= 0 );
	};
	Array.prototype.map = function(f) {
		var a = [];
		Array.prototype.each.call(this,function(i,e){ a.push(f(e)); });
		return a;
	};
	Array.prototype.filter = function(f) {
		var a = [];
		Array.prototype.each.call(this,function(i,e){ if (f(e)) a.push(e); });
		return a;
	};
	Array.prototype.append = function(a) {
		if (a instanceof Array) for (var i=0;i<a.length;i++) this.push(a[i]);
		return this;
	};
	Array.toArray = function(obj) {
		var len = obj.length, arr = new Array(len);
		for (var i = 0; i < len; i++) arr[i] = obj[i];
		return arr;
	};
	Array.safeArray = function(a) {
		var d = new ActiveXObject("Scripting.Dictionary");
		if (a instanceof Array) {
			for (var i=0,len=a.length;i<len;i++) d.Add(d.Count,a[i]);
		}
		return new VBArray(d.Items());
	}
	
	Function.prototype.bind = function(obj){
		var fn = this;
		return function(){ return fn.apply(obj,arguments) };
	};
	
	String.prototype.replaceAll = function(a,b) {
		return this.replace(new RegExp(RegExp.escape(a),'ig'),b);
	};
	String.prototype.trimLeft = function() {
		return this.replace(/^\w*/,'');
	};
	String.prototype.trimRight = function() {
		return this.replace(/\w*$/,'');
	};
	String.prototype.trim = function() {
		return this.replace(/^\w*(.*?)\w*$/,'$1');
	};
	String.prototype.padLeft = function(n,s) {
		var r = String(this), len = r.length;
		return (len < n) ? new Array(n - len + 1).join(s) + r : r;
	};
	String.prototype.padRight = function(n,s) {
		var r = String(this), len = r.length;
		return (len < n) ? r + new Array(n - len + 1).join(s) : r;
	};
	String.prototype.startsWith = function(s) {
		var self = this, re = new RegExp('^' + RegExp.escape(s),'i');
		return String(self).match(re) ? true : false;
	};
	String.prototype.endsWith = function(s) {
		var self = this, re = new RegExp(RegExp.escape(s) + '$','i');
		return String(self).match(re) ? true : false;
	};
	String.prototype.replaceHead = function(s1,s2) {
		var self = this, re = new RegExp('^' + RegExp.escape(s1),'i');
		return String(self).replace(re,s2);
	};
	String.prototype.replaceTail = function(s1,s2) {
		var self = this, re = new RegExp(RegExp.escape(s1) + '$','i');
		return String(self).replace(re,s2);
	};
	String.parse = function(s) {
		return Object.isSet(s) ? String(s) : '';
	};
	String.parseInt = function(s) {
		var i = parseInt(s);
		return isFinite(i) ? i : 0;
	};
	String.getGUID = function() {
		var r = new ActiveXObject("Scriptlet.TypeLib").Guid;
		return r.substr(0,r.length - 2);
	};
	
	String.urlEnc = function(s) {
		return escape(s).replace(/\+/g,'%2B');
	};
	String.urlDec = function(s) {
		return unescape(s.replace(/\+/g,'%20'));
	};
	
	Date.prototype.toGMTString = function() {
		var a = this.toUTCString().split(' ');
		if (a[1].length == 1) a[1] = '0' + a[1];
		return a.join(' ').replace(new RegExp('^(.*)UTC$','ig'),'$1GMT');
	};
	Date.part = {
		yyyy: function(d,utc) {
			return (utc) ? d.getUTCFullYear() : d.getFullYear();
		},
		yy: function(d,utc) {
			return String(this.yyyy(d,utc)).substr(2);
		},
		moy: function(d,utc) {
			return (utc) ? d.getUTCMonth() : d.getMonth();
		},
		m: function(d,utc) {
			return this.moy(d,utc) + 1;
		},
		cc: function(d,utc) {
			return ['January','February','March','April','May','June','July','August','September','October','November','December'][this.moy(d,utc)];
		},
		c: function(d,utc) {
			var s = this.cc(d,utc);
			return s ? s.substr(0,3) : '';
		},
		d: function(d,utc) {
			return (utc) ? d.getUTCDate() : d.getDate();
		},
		dow: function(d,utc) {
			return (utc) ? d.getUTCDay() : d.getDay();
		},
		ww: function(d,utc) {
			return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][this.dow(d,utc)];
		},
		w: function(d,utc) {
			var s = this.ww(d,utc);
			return s ? s.substr(0,3) : '';
		},
		H: function(d,utc) {
			return (utc) ? d.getUTCHours() : d.getHours();
		},
		h: function(d,utc) {
			var i = this.H(d,utc);
			return ( i > 12 || i == 0 ) ? Math.abs(i - 12) : i;
		},
		p: function(d,utc) {
			var i = this.H(d,utc);
			return (i > 11) ? 'pm' : 'am';
		},
		P: function(d,utc) {
			return this.p(d,utc).toUpperCase();
		},
		n: function(d,utc) {
			return (utc) ? d.getUTCMinutes() : d.getMinutes();
		},
		s: function(d,utc) {
			return (utc) ? d.getUTCSeconds() : d.getSeconds();
		}
	};
	['m','d','H','h','n','s'].each(function(i,n){
		Date.part[n + n] = function(d,utc) {
			String(Date.part[n](d,utc)).padLeft(2,'0');
		};
	});
	Date.format = function(d,fmt,utc) {
		var r, type = Object.vartype(d);
		if (type == 'date' || type == 'number') {
			d = new Date(d);
		} else {
			var i = Date.parse(s);
			if (isFinite(i)) d = new Date(i);
		}
		if (!d) return '';
		r = (fmt) ? String(fmt) : '{yyyy}/{mm}/{dd}';
		r = r.replace(/\{(\w)\}/g,function(arr){
			var n = arr[1];
			return (Date.part[a]) ? Date.part[a](d,utc) : arr[0];
		});
		return r;
	};
	
	RegExp.escape = function(s) {
		return String(s).replace(/([.?*+^$[\]\\(){}-])/g,'\\$1');
	};
	
	Enumerator.each = function(col,fn) {
		var i = 0;
		for(var e=new Enumerator(col);!e.atEnd();e.moveNext()) {
			if (fn.call(col,i++,e.item()) === false) break;
		}
	}
	
}
