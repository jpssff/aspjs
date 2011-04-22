/**
 * File Store
 * This class presents an interface for saving files to the filesystem using a database for indexing
 * and meta-data.
 *
 * Requires: lib_docstore.
 *
 */
function lib_filestore() {
  var docstore = require('docstore')
    , fs_database = app.cfg('filestore/database')
    , fs_location = app.cfg('filestore/location')
    , col;
  
  function getCol() {
    if (!col) {
      col = docstore.getStore(fs_database).get('files');
    }
    return col;
  }
  
  function newFileDescriptor(fd) {
    return {
      'name':fd.name,
      'mimetype':fd.mimetype,
      'creationtime':fd.creationtime,
      'uploadtime':__date,
      'lastaccesstime':__date,
      'size':fd.size,
      'hash':hash,
      'imagetype':fd.imagetype,
      'imagewidth':fd.imagewidth,
      'imageheight':fd.imageheight,
      'meta':{}
    };
  }

  function File(fd) {
    if (!(this instanceof File)) return new File(fd);
    this.id = fd.__meta.guid;
    this._fd = fd;
  }
  File.prototype = {
    attr: fngetset({
      get: function(key){
        var fd = this._fd, attr = String(key).toLowerCase();
        if (fd.hasOwnProperty(attr)) {
          return fd[attr];
        } else {
          throw new Error('Invalid File Attribute: ' + key);
        }
      },
      set: function(key, val){
        var fd = this._fd, attr = String(key).toLowerCase()
          , allowed = ['name', 'mimetype', 'creationtime', 'uploadtime', 'lastaccesstime'];
        if (allowed.exists(attr)) {
          fd[attr] = val;
        }
        return this;
      }
    }),
    getFullPath: function() {
      return sys.path.join(fs_location,this._fd.hash);
    },
    clone: function() {
      return new File(getCol().save(newFileDescriptor(this._fd)));
    },
    save: function() {
      getCol().save(this._fd);
    },
    send: function(opts) {
      var self = this, fd = this._fd;
      //default options
      opts = Object.append({
        cache: true,
        attachment: true
      },opts);
      if (opts.cache) {
        var ims = Date.fromString(req.headers('if-modified-since'));
        var inm = req.headers('if-none-match');
        if ((ims && fd.uploadtime <= ims) || (inm && inm == fd.hash)) {
          res.status('304 Not Modified');
          res.end();
        }
        var i = 365 * 24 * 3600;
        res.headers('Cache-Control', 'public, max-age=' + String(i));
        res.headers('Expires', new Date(__now + i * 1000).toGMTString());
        res.headers('Last-Modified', fd.uploadtime.toGMTString());
        res.headers('ETag', '"' + fd.hash + '"');
      }
      res.sendFile({
        file: self.getFullPath(),
        name: fd.name,
        ctype: fd.mimetype,
        attachment: opts.attachment
      });
    },
    valueOf: function() {
      return Object.append({id:this.id},this._fd);
    }
  };
  
  //Private Methods
  function saveFromUploadedFile(file) {
    var path = sys.path.join(fs_location,file.hash);
    app.res.debug('Saving uploaded file "' + file.name + '" to "' + path + '"');
    try {
      file.move(path);
    } catch(e) {
      if (e.message.match(/file already exists/)) {
        try {
          file.discard();
        } catch(e) {}
      } else {
        throw new Error('Error saving file "' + file.name + '" to "' + path + '"; ' + e.message);
      }
    }
    return new File(getCol().save(newFileDescriptor(file)));
  }
  
  //Public Methods
  var filestore = {
    getFile: function(id) {
      if (!id || !String(id).match(/^[\da-f]{32}$/i)) {
        throw new Error('Invalid File ID: ' + id);
      }
      var fd = getCol().get(id);
      if (fd) {
        return new File(fd);
      }
    },
    putFile: function(file) {
      return saveFromUploadedFile(file);
    },
    sendFile: function(id) {
      if (!id || !String(id).match(/^[\da-f]{32}$/i)) {
        throw new Error('Invalid File ID: ' + id);
      }
      var file = this.getFile(id);
      if (file) {
        return file.send();
      }
    },
    isFile: function(file) {
      return file instanceof File;
    }
  };
  
  return filestore;
  
}
