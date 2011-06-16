/**
 * File Store
 * Presents a simple interface for storing, retrieving and serving files / uploads.
 *
 * Requires: lib_docstore
 *
 */
if (!this.lib_filestore) this.lib_filestore = lib_filestore;
function lib_filestore() {
  var docstore = lib('docstore')
    , fs_database = app.cfg('filestore/database')
    , fs_location = app.cfg('filestore/location')
    , col;
  
  function getCol() {
    if (!col) {
      col = docstore.getStore(fs_database).get('files');
    }
    return col;
  }
  
  function newFileRecord(f) {
    var rec = {
      name: f.name,
      mimetype: f.mimetype,
      created: f.created,
      modified: __date,
      size: f.size,
      hash: f.hash,
      imagetype: f.imagetype,
      imagewidth: f.imagewidth,
      imageheight: f.imageheight,
      meta:{}
    };
    return getCol().save(rec);
  }

  /**
   * @constructor
   * @param {Object} rec DocStore Record (document) containing file details
   */
  function File(rec) {
    //Disabled to make IDE happy
    //if (!(this instanceof File)) return new File(rec);
    this.id = rec.__meta.guid;
    this._rec = rec;
  }
  File.prototype = {
    attr: fngetset({
      get: function(key){
        var rec = this._rec, attr = String(key).toLowerCase();
        if (rec.hasOwnProperty(attr)) {
          return rec[attr];
        } else {
          throw new Error('Invalid File Attribute: ' + key);
        }
      },
      set: function(key, val){
        var rec = this._rec, attr = String(key).toLowerCase()
          , allowed = ['name', 'mimetype', 'created', 'modified'];
        if (allowed.exists(attr)) {
          rec[attr] = val;
          if (attr != 'modified') {
            rec.modified = __date;
          }
        }
        return this;
      }
    }),
    getFullPath: function() {
      return sys.path.join(fs_location,this.attr('hash'));
    },
    clone: function() {
      var rec = newFileRecord(this._rec);
      return new File(rec);
    },
    save: function() {
      getCol().save(this._rec);
    },
    send: function(opts) {
      var file = this, rec = this._rec;
      //default options
      opts = Object.append({
        cache: true,
        attachment: true
      },opts);
      if (opts.cache) {
        var ims = Date.fromString(req.headers('if-modified-since'));
        var inm = req.headers('if-none-match');
        if ((ims && file.attr('created') <= ims) || (inm && inm == file.attr('hash'))) {
          res.status('304 Not Modified');
          res.end();
        }
        var i = 365 * 24 * 3600;
        res.headers('Cache-Control', 'public, max-age=' + String(i));
        res.headers('Expires', new Date(__date.valueOf() + i * 1000).toGMTString());
        res.headers('Last-Modified', file.attr('created').toGMTString());
        res.headers('ETag', '"' + file.attr('hash') + '"');
      }
      res.sendFile({
        file: file.getFullPath(),
        name: file.attr('name'),
        ctype: file.attr('mimetype'),
        attachment: opts.attachment
      });
    },
    toJSON: function() {
      var obj = Object.append({id: this.id}, this._rec);
      //TODO: remove this when docstore prototype chain is fixed
      Object.remove(obj, '_id');
      return obj;
    }
  };
  
  function saveUpload(upload) {
    var path = sys.path.join(fs_location,upload.hash);
    try {
      upload.move(path);
    } catch(e) {
      if (e.message.match(/file already exists/i)) {
        try {
          upload.discard();
        } catch(e) {}
      } else {
        throw new Error('Error saving file "' + upload.name + '" to "' + path + '"; ' + e.message);
      }
    }
    var rec = newFileRecord(upload);
    return new File(rec);
  }
  
  return {
    getFile: function(id) {
      if (id && String(id).match(/^[\da-f]{32}$/i)) {
        var rec = getCol().get(id);
      }
      if (rec) {
        return new File(rec);
      }
    },
    saveUpload: function(upload) {
      return saveUpload(upload);
    },
    sendFile: function(id) {
      var file = this.getFile(id);
      if (file) {
        return file.send();
      }
    },
    isFile: function(file) {
      return file instanceof File;
    }
  };

}
