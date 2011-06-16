if (global.GENTLY) require = GENTLY.hijack(require);

// This is a buffering parser, not quite as nice as the multipart one.

function JSONParser() {
  this.buffer = '';
}
exports.JSONParser = JSONParser;

JSONParser.prototype.write = function(buffer) {
  this.buffer += buffer.toString('ascii');
  return buffer.length;
};

JSONParser.prototype.end = function() {
  var self = this, data = this.buffer, obj;
  if (data && data.length) {
    try {
      obj = JSON.parse(data);
    } catch(e) {}
    if (obj) {
      Object.keys(obj).forEach(function(n) {
        var val = obj[n], type = typeof val;
        if (val === null || type == 'undefined') {
          self.onField(n, '');
        } else
        if (type == 'string' || type == 'number' || type == 'boolean') {
          self.onField(n, String(val));
        } else {
          self.onField(n, JSON.stringify(val));
        }
      });
    }
  }
  this.buffer = '';
  this.onEnd();
};
