/**
 * Collection Class
 *
 * A Collection is a case-insensitive, function-wrapped set of
 * key/value pairs much like the built-in object type but with
 * extended functionality (ie. sort, count) and it guarantees
 * no method-property collisions.
 *
 * Example Usage:
 * var list = new Collection(); //with or without the word new
 * list('fruit','banana'); //shorthand for list.set(..)
 * list('Fruit'); //returns 'banana' (case-insensitive)
 * list('valueOf',2.27);
 * list.count(); //returns 2
 * list.valueOf(); //returns object {'fruit':'banana','valueOf':2.27}
 *
 */
function Collection(data) {
	
	if (!Collection.proto) {
		Collection.proto = _Collection_proto();
	}
	
	var obj = function() {
		return obj.access.apply(obj,arguments);
	};
	
	var proto = obj.__proto__ = Collection.proto;
	for (var n in proto) if (proto.hasOwnProperty(n)) obj[n] = proto[n];
	obj['toString'] = proto['toString'];
	obj['valueOf'] = proto['valueOf'];
	
	obj.append(data);
	
	return obj;
	
}

function _Collection_proto() {
	
	function each(o,f) {
		for (var n in o) if (exists(o,n)) f.call(o,n,o[n]);
		var a = ['constructor','hasOwnProperty','isPrototypeOf','propertyIsEnumerable','toLocaleString','toString','valueOf'];
		for (var i=0;i<a.length;i++) if (exists(o,a[i])) f.call(o,a[i],o[a[i]]);
	}
	function exists(o,n) {
		return Object.prototype.hasOwnProperty.call(o,n);
	}
	function vartype(obj) {
		if (obj === null) return 'null';
		var type = typeof obj;
		if (obj instanceof Object) {
			var arr = (/\[object (\w+)\]/).exec(Object.prototype.toString.call(obj));
			if (arr) type = arr[1].toLowerCase();
			return type;
		}
		return (type == 'object') ? 'unknown' : type;
	}
	
	return {
		_count: 0,
		_items: {},
		_listeners: {},
		access: function(key,val){
			if (arguments.length == 1) {
				return (vartype(key) == 'object') ? this.append(key) : this.get(key);
			} else {
				return (val === null) ? this.remove(key) : this.set(key,val);
			}
		},
		get: function(key) {
			key = String(key);
			if (this.exists(key)) {
				this.trigger('get',key);
				return this._items[key.toUpperCase()][1];
			}
		},
		set: function(key,val) {
			key = String(key);
			this.trigger('set',key,val);
			if (this.exists(key)) {
				this.trigger('overwrite',key,val);
			} else {
				this._count ++;
			}
			this._items[key.toUpperCase()] = [key,val];
			return val;
		},
		remove: function(key) {
			key = String(key), n = key.toUpperCase(), val;
			if (this.exists(key)) {
				this.trigger('remove',key);
				val = this._items[n][1];
				delete this._items[n];
				this._count --;
			}
			return val;
		},
		append: function(obj) {
			if (obj.__proto__ === Collection.proto) {
				obj.each(obj,function(n,val){ this.set(n,val); });
			} else {
				each(obj,function(n,val){ this.set(n,val); });
			}
			return this;
		},
		exists: function(key) {
			return this._items.hasOwnProperty(String(key).toUpperCase());
		},
		count: function() {
			return this._count;
		},
		each: function(fn) {
			var o = this._items, a = this.keys();
			for (var i=0,len=a.length;i<len;i++) {
				var val = fn.call(this,a[i],o[a[i].toUpperCase()][1]);
				if (val !== undefined) this.access(a[i],val);
			}
			return this;
		},
		keys: function() {
			var o = this._items, a = [];
			for (var n in o) if (exists(o,n)) a.push(o[n][0]);
			return a;
		},
		values: function() {
			var o = this._items, a = [];
			for (var n in o) if (exists(o,n)) a.push(o[n][1]);
			return a;
		},
		sort: function() {
			var a = this.keys();
			a.sort();
			var list = {}
			for (var i=0,len=a.length;i<len;i++) {
				var n = a[i].toUpperCase();
				list[n] = this._items[n];
			}
			this._items = list;
			return this;
		},
		on: function(evt,fn) {
			var lis = this._listeners;
			if (vartype(fn) == 'function') {
				if (!lis[evt]) lis[evt] = [];
				lis[evt].push(fn);
			}
		},
		trigger: function(evt) {
			var lis = this._listeners;
			if (lis[evt])
			for (var i=0;i<lis[evt].length;i++)
			lis[evt][i].apply(this,Array.prototype.slice.call(arguments,1));
		},
		toString: function() {
			var o = this._items, a = [];
			for (var n in o) if (exists(o,n)) a.push('"' + o[n][0] + '":"' + o[n][1] + '"');
			return '{' + a.join(',') + '}'
		},
		valueOf: function() {
			var o = this._items, obj = {};
			for (var n in o) if (exists(o,n)) obj[o[n][0]] = o[n][1];
			return obj;
		},
		type: function(n) {
			return vartype(this.get(n));
		}
	};
	
}
