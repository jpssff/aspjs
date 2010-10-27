/**
 * Document Data Store: This class presents an abstraction layer
 * for storing document objects (nested key/value pairs and lists)
 * in a shema-less fashion. The underlying data store in this case is a
 * simple Access database which is created if it does not already exist.
 *
 * The class abstracts the data store so that it can be interacted with as
 * if it were shema-less; in essence, presenting a data-access library 
 * to insert, query, update and delete document objects from collections.
 *
 * The interface is loosely based on MongoDB (http://www.mongodb.org/).
 *
 * - Collections are like tables in the sense that they are top-level
 *    objects containing data records.
 * - Documents are like rows in that they are children of Collections
 *   and one or more is returned by a query.
 * - Documents contain key-value pairs and the values can be of any supported
 *   type including lists of values (arrays), other key-value pairs, or
 *   pointers to document objects in the same another collection.
 *
 */
function lib_docstore() {
	
	var msa = require('msaccess')
		, json = require('json');
	
	function DocStore(name) {
		var self = this;
		this._name = name;
		this._conn = msa.open(name);
		var collections = {}
			, db = this._conn
			, q = "SELECT * FROM [col] WHERE [status] = 'active'";
		db.query(q,function(rec){
			collections[rec.col_name] = new Collection(self,rec.col_id,rec.col_name);
		});
		this._all = collections;
	}
	
	DocStore.prototype = {
		create: function(name) {
			var collections = this._all
				, db = this._conn
				, q = "INSERT INTO [col] ([col_name],[status]) VALUES ($1,'active')";
			var id = db.exec(q,[name],true);
			collections[name] = new Collection(this,id,name);
			return collections[name];
		},
		get: function(name) {
			var collections = this._all;
			if (Object.exists(collections,name)) return collections[name];
			return this.create(name);
		},
		drop: function(name) {
			var collections = this._all
				, db = this._conn
				, q = "UPDATE [col] SET [status] = 'deleted' WHERE [col_name] = $1";
			db.exec(q,[name]);
			Object.remove(collections,name);
		}
	}
	
	function Collection(docstore,id,name) {
		this._docstore = docstore;
		this._id = id;
		this._name = name;
	}
	
	Collection.prototype = {
		get: function(guid) {
			var db = this._docstore._conn;
			var q = "SELECT * FROM [doc] INNER JOIN [rec] ON [doc].[doc_id] = [rec].[doc] WHERE [doc].[col] = $1 AND [doc].[guid] = $GUID($2)";
			var doc = {_id:guid};
			db.query(q,[this._id,guid],function(rec){
				doc[rec.name] = fn_decode(rec.type,rec.value);
			});
			return doc;
		},
		find: function(query) {
			var self = this
				, db = this._docstore._conn
				, a = []
				, p = [this._id];
			Object.each(query,function(n,val){
				var i = p.length + 1;
				a.push(" ( [rec].[name] = $" + i + " AND [rec].[value] = $" + (i + 1) + " ) ");
				p.push(n);
				p.push(fn_encode(val).val);
			});
			if (!a.length) return [];
			var q = "SELECT * FROM [doc] INNER JOIN [rec] ON [doc].[doc_id] = [rec].[doc] WHERE [doc].[col] = $1 AND (" + a.join("OR") + ")";
			var found = {}, docs = [];
			db.query(q,p,function(rec){
				var n = rec.guid;
				if (!found[n]) {
					found[n] = true;
					docs.push(self.get(n));
				}
			});
			return docs;
		},
		findOne: function(query) {
			//TODO
		},
		save: function(doc) {
			var db = this._docstore._conn
				, col_id = this._id
				, guid = doc._id, id;
			if (guid) {
				var q = "SELECT * FROM [doc] WHERE [guid] = $GUID($1)";
				db.query(q,[guid],function(rec){
					id = rec.doc_id;
					return false;
				});
			} else {
				guid = doc._id = String.getGUID();
				q = "INSERT INTO [doc] ([col],[guid]) VALUES ($1,$GUID($2))";
				id = db.exec(q,[col_id,guid],true);
			}
			var old = this.get(guid);
			fn_compare(old,doc
			 ,function add(n,type,val){
				q = "INSERT INTO [rec] ([doc],[name],[type],[value]) VALUES ($1,$2,$3,$4)";
				db.exec(q,[id,n,type,val]);
			},function upd(n,type,val){
				q = "UPDATE [rec] SET [type] = $3, [value] = $4 WHERE [doc] = $1 AND [name] = $2";
				db.exec(q,[id,n,type,val]);
			},function del(n){
				q = "DELETE FROM [rec] WHERE [doc] = $1 AND [name] = $2";
				db.exec(q,[id,n]);
			});
			return doc;
		},
		drop: function() {
			//TODO
		}
	}
	
	function fn_each(o,fn) {
		Object.each(o,function(n,val,i){
			if (n != '_id') return fn.call(o,n,val,i);
		});
	}
	
	function fn_compare(old,doc,fn_add,fn_upd,fn_del) {
		fn_each(doc,function(n,val){
			if (Object.exists(doc,n)) {
				if (old[n] !== doc[n]) {
					var data = fn_encode(val);
					fn_upd(n,data.type,data.val);
				}
			} else {
				var data = fn_encode(val);
				fn_add(n,data.type,data.val);
			}
		});
		fn_each(old,function(n,val){
			if (!Object.exists(doc,n)) {
				fn_del(n);
			}
		});
	}
	
	function fn_encode(val) {
		var type = vartype(val), data, json = require('json');
		if (['boolean','number','string'].exists(type)) {
			data = {type:type,val:String(val)};
		} else
		if (type == 'date') {
			data = {type:'date',val:String(val.valueOf())};
		} else
		if (type == 'object') {
			data = {type:'object',val:json.stringify(val)};
		} else {
			data = {type:'null',val:'null'};
		}
		return data;
	}
	
	function fn_decode(type,val) {
		var decode, data, json = require('json');
		decode = {
			boolean:Boolean,
			number:Number,
			string:String
		};
		if (Object.exists(decode,type)) {
			data = decode[type](val);
		} else
		if (type == 'date') {
			data = new Date(parseInt(val));
		} else
		if (type == 'object') {
			data = json.parse(val);
		}
		return data;
	}
	
	return {
		getDB: function(name) {
			return new DocStore(name);
		}
	};
	
}
