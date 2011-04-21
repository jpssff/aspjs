/**
 * Collection Class
 *
 * A Collection is a case-insensitive, function-wrapped set of
 * key/value pairs much like the built-in object type but with
 * extended functionality (ie. sort, count) and it guarantees
 * no method-property collisions.
 *
 * Example Usage: (new operator is optional)
 *  var product = new Collection({item:'apple',type:'fruit'});
 *  product('item','banana'); //shorthand for product.set(..)
 *  product('Type'); //returns 'fruit' (case-insensitive)
 *  product('valueOf',2.27);
 *  product.count(); //returns 3
 *  product(); //returns object
 *   {item:'banana',type:'fruit','valueOf':2.27}
 *  product({price:2.95,inStock:true}); //append
 *  product(function(n,val){ display(n,val); }); //iterate
 *
 */
function Collection(data) {
	
	if (!Collection.proto) {
		Collection.proto = _Collection_proto();
	}
	
	var obj = function() {
		return obj.access.apply(obj,arguments);
	};
	obj._count = 0;
	obj._items = {};
	obj._dirty = false;
	obj._listeners = {};
	
	var proto = obj.__proto__ = Collection.proto;
	for (var n in proto) if (proto.hasOwnProperty(n)) obj[n] = proto[n];
	obj['toString'] = proto['toString'];
	obj['valueOf'] = proto['valueOf'];
	
	if (data) {
		obj.append(data);
	}
	
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
			var arr = Object.prototype.toString.call(obj).match(/(\w+)\]$/);
			if (arr) type = arr[1].toLowerCase();
			return type;
		}
		return (type == 'object') ? 'unknown' : type;
	}
	
	return {
		access: function(p1,p2){
			if (arguments.length == 0) {
				return this.valueOf();
			} else
			if (arguments.length == 1) {
				switch (vartype(p1)) {
					case 'function':
						return this.each(p1);
						break;
					case 'object':
						return this.append(p1);
						break;
					default:
						return this.get(p1);
				}
			} else {
				return (p2 === null) ? this.remove(p1) : this.set(p1,p2);
			}
		},
		clear: function() {
			this._count = 0;
			this._items = {};
			this._dirty = true;
			return this;
		},
		get: function(key) {
			if (vartype(key) == 'function') return this.each(key);
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
			this._dirty = true;
			return val;
		},
		remove: function(key) {
			key = String(key);
			var n = key.toUpperCase(), val;
			if (this.exists(key)) {
				this.trigger('remove',key);
				val = this._items[n][1];
				delete this._items[n];
				this._count --;
			}
			this._dirty = true;
			return val;
		},
		append: function(obj) {
			var col = this;
			if (obj.__proto__ === Collection.proto) {
				obj.each(obj,function(n,val){ col.set(n,val); });
			} else {
				each(obj,function(n,val){ col.set(n,val); });
			}
			return this;
		},
		exists: function(key) {
			return exists(this._items,String(key).toUpperCase());
		},
		count: function() {
			return this._count;
		},
		dirty: function() {
			return this._dirty;
		},
		clearDirty: function() {
			this._dirty = false;
			return this;
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
			var list = {};
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
			return this;
		},
		trigger: function(evt) {
			var lis = this._listeners;
			if (lis[evt])
			for (var i=0;i<lis[evt].length;i++)
			lis[evt][i].apply(this,Array.prototype.slice.call(arguments,1));
			return this;
		},
		toString: function() {
			return '[object Collection]';
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
