/*!
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
 *  product('valueOf', 2.27);
 *  product.count(); //returns 3
 *  product(); //returns object
 *   {item: 'banana', type: 'fruit', 'valueOf': 2.27}
 *  product({price: 2.95, inStock: true}); //append
 *  product(function(n, val) { display(n, val); }); //iterate
 *
 */
if (!this.Collection) this.Collection = Collection;
function Collection(data, opts) {

  if (!Collection.prototype.access) {
    Collection.prototype = Collection__proto();
  }

  opts = opts || {};

  var col = function() {
    return col.access.apply(col, arguments);
  };
  col._count = 0;
  col._items = {};
  col._listeners = {};
  
  if (Object.prototype === {}.__proto__) {
    col.__proto__ = Collection.prototype;
  } else {
    var proto = col.__proto__ = Collection.prototype;
    for (var n in proto) if (proto.hasOwnProperty(n)) col[n] = proto[n];
    col['toString'] = proto['toString'];
  }

  if (data) {
    col.append(data);
  }
  if (data && opts.allowReset) {
    col.reset = function() {
      col.clear();
      col.append(data);
      col._dirty = false;
    };
  }
  col._dirty = false;
  if (opts.readOnly) {
    col.on('modify', function() {
      throw new Error("Collection '" + opts.name + "' is read-only and cannot be modified");
    });
  }

  return col;
  
}

function Collection__proto() {

  function fn_each(o, f) {
    for (var n in o) if (fn_exists(o, n)) {
      f.call(o, n, o[n]);
    }
    var a = ['constructor','hasOwnProperty','isPrototypeOf','propertyIsEnumerable','toLocaleString','toString','valueOf'];
    for (var i = 0; i < a.length; i++) {
      if (fn_exists(o, a[i])) f.call(o, a[i], o[a[i]]);
    }
  }

  function fn_append(o, p) {
    fn_each(p, function(n, val) {
      o[n] = val;
    });
    return o;
  }

  function fn_exists(o, n) {
    return Object.prototype.hasOwnProperty.call(o, n);
  }

  function fn_typeOf(obj) {
    var type = (obj === null) ? 'null' : typeof obj;
    if (obj instanceof Object) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }
    return (type == 'object') ? 'unknown' : type;
  }

  var proto;
  if (Object.prototype === {}.__proto__) {
    proto = Object.create(Function.prototype);
  } else {
    proto = {};
  }

  return fn_append(proto, {
    access: function(p1, p2) {
      if (arguments.length == 0) {
        return this.toObject();
      } else
      if (arguments.length == 1) {
        switch (fn_typeOf(p1)) {
          case 'function':
            return this.each(p1);
          case 'object':
            return this.append(p1);
          default:
            return this.get(p1);
        }
      } else {
        return (p2 === null) ? this.remove(p1) : this.set(p1, p2);
      }
    },
    clear: function() {
      this.trigger('modify');
      this._count = 0;
      this._items = {};
      if (!this._dirty) this.trigger('dirty');
      this._dirty = true;
      return this;
    },
    get: function(key) {
      if (fn_typeOf(key) == 'function') return this.each(key);
      key = String(key);
      if (this.exists(key)) {
        this.trigger('get', key);
        return this._items[key.toUpperCase()][1];
      }
    },
    set: function(key, val) {
      this.trigger('modify');
      key = String(key);
      this.trigger('set', key, val);
      if (this.exists(key)) {
        this.trigger('overwrite', key, val);
      } else {
        this.trigger('add', key, val);
        this._count ++;
      }
      this._items[key.toUpperCase()] = [key,val];
      if (!this._dirty) this.trigger('dirty');
      this._dirty = true;
      return val;
    },
    remove: function(key) {
      this.trigger('dirty');
      key = String(key);
      var n = key.toUpperCase(), val;
      if (this.exists(key)) {
        this.trigger('remove', key);
        val = this._items[n][1];
        delete this._items[n];
        this._count --;
      }
      if (!this._dirty) this.trigger('dirty');
      this._dirty = true;
      return val;
    },
    append: function(obj) {
      var col = this;
      if (obj.__proto__ === Collection.prototype) {
        obj.each(obj, function(n, val) {
          col.set(n, val);
        });
      } else {
        fn_each(obj, function(n, val) {
          col.set(n, val);
        });
      }
      return this;
    },
    exists: function(key) {
      return fn_exists(this._items, String(key).toUpperCase());
    },
    count: function() {
      return this._count;
    },
    isDirty: function() {
      return this._dirty;
    },
    clearDirty: function() {
      this._dirty = false;
      return this;
    },
    each: function(fn) {
      var o = this._items, a = this.keys();
      for (var i = 0,len = a.length; i < len; i++) {
        var val = fn.call(this, a[i], o[a[i].toUpperCase()][1]);
        if (val !== undefined) this.access(a[i], val);
      }
      return this;
    },
    keys: function() {
      var o = this._items, a = [];
      for (var n in o) if (fn_exists(o, n)) a.push(o[n][0]);
      return a;
    },
    values: function() {
      var o = this._items, a = [];
      for (var n in o) if (fn_exists(o, n)) a.push(o[n][1]);
      return a;
    },
    sort: function() {
      var a = this.keys();
      a.sort();
      var list = {};
      for (var i = 0, len = a.length; i < len; i++) {
        var n = a[i].toUpperCase();
        list[n] = this._items[n];
      }
      this._items = list;
      return this;
    },
    on: function(evt, fn) {
      var lis = this._listeners;
      if (fn_typeOf(fn) == 'function') {
        if (!lis[evt]) lis[evt] = [];
        lis[evt].push(fn);
      }
      return this;
    },
    trigger: function(evt) {
      var list = this._listeners;
      if (list[evt])
        for (var i = 0; i < list[evt].length; i++)
          list[evt][i].apply(this, Array.prototype.slice.call(arguments, 1));
      return this;
    },
    toObject: function() {
      var o = this._items, obj = {};
      for (var n in o) if (fn_exists(o, n)) obj[o[n][0]] = o[n][1];
      return obj;
    },
    toString: function() {
      return '[object Collection]';
    },
    type: function(n) {
      return fn_typeOf(this.get(n));
    },
    toJSON: function() {
      return this.toObject();
    }
  });
  
}
