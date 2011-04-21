/**
 * File Store
 * This class presents an interface for saving files to the filesystem using a database for indexing
 * and saving meta-data.
 *
 * This class depends on docstore (which requires an underlying relational database) and also depends
 * on Persits ASPUpload for file operations.
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
			set: function(key,val){
				var fd = this._fd, attr = String(key).toLowerCase()
					, allowed = ['name','mimetype','creationtime','uploadtime','lastaccesstime'];
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
			var f = this._fd, new_fd;
			new_fd = {
				'name':f.name,
				'mimetype':f.mimetype,
				'creationtime':f.creationtime,
				'uploadtime':__date,
				'lastaccesstime':__date,
				'size':f.size,
				'hash':hash,
				'imagetype':f.imagetype,
				'imagewidth':f.imagewidth,
				'imageheight':f.imageheight,
				'meta':{}
			}
			return new File(getCol().save(new_fd));
		},
		save: function() {
			var fd = this._fd;
			getCol().save(fd);
		},
		send: function(args) {
			args = args || {};
			var fd = this._fd
				, fp = this.getFullPath()
				, h = args.headers || {};
			if (vartype(args.exp) != 'number') args.exp = 365;
			var i = args.exp * 24 * 3600;
			h['Cache-Control'] = 'public, max-age=' + String(i);
			h['Expires'] = new Date(__now + i * 1000).toGMTString();
			h['Last-Modified'] = fd.uploadtime.toGMTString();
			h['ETag'] = '"' + fd.hash + '"';
			res.headers(h);
			var ims_date = Date.fromString(req.headers('if-modified-since'));
			if (ims_date && fd.uploadtime <= ims_date) {
				res.status('304 Not Modified');
				res.end();
			}
			var inm_string = req.headers('if-none-match');
			if (inm_string && inm_string == fd.hash) {
				res.status('304 Not Modified');
				res.end();
			}
			var upload = new ActiveXObject("Persits.Upload");
			try {
				res.buffer(false);
				upload.sendbinary(sys.mappath(fp),true,fd.mimetype,!!args.attachment,'"' + fd.name.replaceAll('"',"'") + '"');
			} catch(e) {
				res.buffer(true);
				throw new Error('Error Serving File "' + fp + '"; ' + e.message);
			}
			res.end();
		},
		valueOf: function() {
			return Object.append({id:this.id},this._fd);
		}
	};
	
	//Private Methods
	function saveFromUploadedFile(f) {
		var fd, hash = f.MD5Hash, path = sys.path.join(fs_location,hash);
		try {
			f.move(sys.mappath(path));
		} catch(e) {
			if (!e.message.match(/file already exists/)) {
				throw new Error('Error saving file "' + f.filename + '" to "' + path + '"; ' + e.message);
			}
		}
		fd = {
			'name':f.OriginalFileName,
			'mimetype':f.ContentType,
			'creationtime':new Date(f.CreationTime),
			'uploadtime':__date,
			'lastaccesstime':__date,
			'size':f.Size,
			'hash':hash,
			'imagetype':f.ImageType,
			'imagewidth':f.ImageWidth,
			'imageheight':f.ImageHeight,
			'meta':{}
		}
		return new File(getCol().save(fd));
	}
	
	function saveFromData(name,data) {
		//TODO:
		// Save to temp
		// Open using Persits
		// Call saveFromUploadedFile
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
