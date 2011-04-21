if (global.GENTLY) require = GENTLY.hijack(require);

var util = require('./util'),
    WriteStream = require('fs').WriteStream,
    EventEmitter = require('events').EventEmitter,
    crypto;

try {
	crypto = require('crypto');
} catch (e) {
	//console.log('crypto support not found');
}

function File(properties) {
  EventEmitter.call(this);

  this.size = 0;
  this.path = null;
  this.name = null;
  this.type = null;
  this.hash = null;
  this.lastModifiedDate = null;

  this._writeStream = null;

  for (var key in properties) {
    this[key] = properties[key];
  }
}
module.exports = File;
util.inherits(File, EventEmitter);

File.prototype.open = function() {
  this._writeStream = new WriteStream(this.path);
	if (crypto) {
		this.hash = crypto.createHash("md5");
	}
};

File.prototype.write = function(buffer, cb) {
  var self = this;
  this._writeStream.write(buffer, function() {
    self.lastModifiedDate = new Date();
    self.size += buffer.length;
		if (crypto) {
      self.hash.update(buffer);
    }
    self.emit('progress', self.size);
    cb();
  });
};

File.prototype.end = function(cb) {
  var self = this;
  this._writeStream.end(function() {
    if (crypto) {
      self.hash = self.hash.digest("hex");
    }
		self.emit('end');
    cb();
  });
};

File.prototype.toJSON = function() {
	var self = this, obj = {};
	Object.keys(this).forEach(function(n){
		if (n.charAt(0) != '_') {
			obj[n] = self[n];
		}
	});
	return obj;
};
