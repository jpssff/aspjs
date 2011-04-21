/**
 * Document Data Store: This class presents an abstraction layer
 * for storing document objects (key/value pairs of serializable data)
 * in a shema-less fashion. The underlying structure in this case is a
 * simple relational database, existing in the form of a file on disk,
 * which is created if it does not already exist.
 *
 * The class abstracts the database so that it can be interacted with as
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
 * - The order of document properties (keys) are not preserved.
 *
 */
function lib_docstore() {
  
  var msa = require('msaccess')
    , json = require('json');
  
  var sys_cfg = app.cfg('docstore');
  
  /**
   * DocStore Class
   * Returns a Document Store object that has methods to create, open and
   * delete stores. Stores, in this implementation, map directly to db files
   * on disk and contain collections, which contain documents.
   *
   */
  function DocStore(name,cfg) {
    var self = this;
    this.name = name;
    this.cfg = Object.append({},sys_cfg,cfg);
    this.db = msa.open(name,dbInit);
    var collections = {}
      , db = this.db
      , q = "SELECT * FROM [col] WHERE [status] = 'active'";
    db.query(q,function(rec){
      collections[rec.col_name] = new Collection(self,rec.col_id,rec.col_name);
    });
    this._all = collections;
  }
  
  DocStore.prototype = {
    create: function(name) {
      var collections = this._all
        , db = this.db
        , q = "INSERT INTO [col] ([col_name],[status]) VALUES ($1,'active')";
      var col_id = db.exec(q,[name],true);
      collections[name] = new Collection(this,col_id,name);
      return collections[name];
    },
    get: function(name) {
      var collections = this._all;
      if (Object.exists(collections,name)) return collections[name];
      return this.create(name);
    },
    drop: function(name) {
      var collections = this._all
        , db = this.db
        , q = "UPDATE [col] SET [status] = 'deleted' WHERE [col_name] = $1";
      db.exec(q,[name]);
      Object.remove(collections,name);
    }
  }
  
  /**
   * Collection Class
   * Returns a Collection object that has methods to query, update and save
   * document objects into the collection.
   *
   */
  function Collection(docstore,col_id,name) {
    this.docstore = docstore;
    this.col_id = col_id;
    this.name = name;
  }
  
  Collection.prototype = {
    //Get doc by unique parameter (used internally)
    _get: function(param) {
      var db = this.docstore.db, q;
      //Get reference details
      if (param.dbid) {
        q = db.query("SELECT * FROM [doc] WHERE [col] = $1 AND [doc_id] = $2",[this.col_id,param.dbid])
      } else
      if (param.guid) {
        q = db.query("SELECT * FROM [doc] WHERE [col] = $1 AND [guid] = CAST_GUID($2)",[this.col_id,param.guid])
      } else {
        q = db.query("SELECT * FROM [doc] WHERE [col] = $1 AND [doc_num] = $2",[this.col_id,Number.parse(param.doc_num)])
      }
      var ref = q.getOne(), data = {};
      if (ref) {
        ref.guid = ref.guid.replace(/[{}-]/g,'').toLowerCase();
        ref.doc_num = String(ref.doc_num);
        //Get data members
        q = "SELECT * FROM [rec] WHERE [doc] = $1";
        db.query(q,[ref.doc_id],function(rec){
          data[rec.name] = fn_decode(rec.type,rec.value);
        });
        return createDoc(this,ref,data);
      }
    },
    //Get doc by number or GUID
    get: function(id) {
      id = String(id);
      if (id.match(/^\d+$/)) {
        return this._get({doc_num:id});
      } else
      if (id.match(/^[\da-f]{32}$/i)) {
        return this._get({guid:id});
      } else {
        throw new Error('Invalid Doc ID: ' + id);
      }
    },
    getAll: function() {
      var col = this, db = col.docstore.db, all = [], q;
      q = "SELECT * FROM [doc] WHERE [col] = $1";
      db.query(q,[col.col_id],function(ref){
        ref.guid = ref.guid.replace(/[{}-]/g,'').toLowerCase();
        var data = {};
        var q = "SELECT * FROM [rec] WHERE [doc] = $1";
        db.query(q,[ref.doc_id],function(rec){
          data[rec.name] = fn_decode(rec.type,rec.value);
        });
        all.push(createDoc(col,ref,data));
      });
      return all;
    },
    //TODO: Deep queries, conditional queries
    find: function(query) {
      var all = this.getAll(), docs = [];
      all.each(function(i,doc){
        var match = true;
        Object.each(query,function(n,val){
          if (doc[n] !== val) return (match = false);
        });
        if (match) docs.push(doc);
      });
      return docs;
    },
    findOne: function(query) {
      var docs = this.find(query);
      if (docs) return docs[0];
    },
    save: function(source) {
      var db = this.docstore.db
        , col_id = this.col_id
        , existing;
      if (source._id) {
        existing = this.get(source._id);
      }
      if (!existing) {
        q = "INSERT INTO [doc] ([col],[guid],[created]) VALUES ($1,CAST_GUID($2),NOW_UTC())";
        var dbid = db.exec(q,[col_id,String.getGUID()],true);
        db.exec("UPDATE [doc] SET [doc_num] = $1 WHERE [doc_id] = $2",[dbid + 121392,dbid])
        existing = this._get({dbid:dbid});
      }
      fn_compare(existing,source
       ,function add(n,type,val){
        q = "INSERT INTO [rec] ([doc],[name],[type],[value]) VALUES ($1,$2,$3,$4)";
        db.exec(q,[existing.__meta.dbid,n,type,val]);
      },function upd(n,type,val){
        q = "UPDATE [rec] SET [type] = $3, [value] = $4 WHERE [doc] = $1 AND [name] = $2";
        db.exec(q,[existing.__meta.dbid,n,type,val]);
      },function del(n){
        q = "DELETE FROM [rec] WHERE [doc] = $1 AND [name] = $2";
        db.exec(q,[existing.__meta.dbid,n]);
      });
      return new Document(this,existing.__meta,source);
    },
    drop: function() {
      //TODO
    }
  }
  
  /**
   * Document Class
   * Returns a Document object with the provided reference parameters (one level
   * up the prototype chain) and the key/value pairs from data.
   *
   */
  function Document(col,meta,data) {
    if (!(this instanceof Document)) {
      return new Document(col,meta,data);
    }
    this.__collection = col;
    this.__meta = meta;
    var doc = Object.create(this);
    doc._id = (col.docstore.cfg.numeric_id) ? meta.id : meta.guid;
    return Object.combine(doc,data);
  }
  
  /**
   * Helper Functions
   *
   */
  function createDoc(col,ref,data) {
    return new Document(col,{id:ref.doc_num,guid:ref.guid,dbid:ref.doc_id,created:ref.created},data);
  }
  function dbInit(conn) {
    var q = "CREATE TABLE [col] ([col_id] COUNTER CONSTRAINT [pk_col_id] PRIMARY KEY, [col_name] TEXT(255), [status] TEXT(50))"
    conn.exec(q);
    //var q = "CREATE TABLE [doc] ([doc_id] COUNTER CONSTRAINT [pk_doc_id] PRIMARY KEY, [col] INT, [doc_num] COUNTER(121393,1), [guid] GUID, [created] DATETIME)"
    //conn.exec(q);
    var q = "CREATE TABLE [doc] ([doc_id] COUNTER CONSTRAINT [pk_doc_id] PRIMARY KEY, [doc_num] INT, [guid] GUID, [col] INT, [created] DATETIME)"
    conn.exec(q);
    var q = "CREATE TABLE [rec] ([rec_id] COUNTER CONSTRAINT [pk_rec_id] PRIMARY KEY, [doc] INT, [name] TEXT(255), [type] TEXT(255), [value] MEMO)"
    conn.exec(q);
  }
  
  function fn_each(o,fn) {
    Object.each(o,function(n,val,i){
      if (n != '_id') return fn.call(o,n,val,i);
    });
  }
  
  function fn_compare(old,doc,fn_add,fn_upd,fn_del) {
    fn_each(doc,function(n,val){
      if (Object.exists(old,n)) {
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
      data = {type:'date',val:String(new Date(val).valueOf())};
    } else
    if (type == 'object' || type == 'array') {
      data = {type:type,val:json.stringify(val)};
    } else {
      data = {type:'null',val:'null'};
    }
    return data;
  }
  
  function fn_decode(type,val) {
    var decode, data, json = require('json');
    decode = {
      boolean:function(s){ return (s == 'true'); },
      number:Number,
      string:String,
      date:function(s){ return new Date(Number(s)); },
      array:json.parse,
      object:json.parse
    };
    if (Object.exists(decode,type)) {
      data = decode[type](val);
    }
    return data;
  }
  
  /**
   * Public Methods
   *
   */
  return {
    getStore: function(name,cfg) {
      return new DocStore(name,cfg);
    },
    isDocument: function(o) {
      return o instanceof Document;
    }
  };
  
}
