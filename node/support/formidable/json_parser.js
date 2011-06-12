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
        self.onField(n, obj[n]);
        //self.onField(n, JSON.stringify(obj[n]));
      });
    }
  }
  this.buffer = '';
  this.onEnd();
};
