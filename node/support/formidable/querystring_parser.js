if (global.GENTLY) require = GENTLY.hijack(require);

// This is a buffering parser, not quite as nice as the multipart one.
// If I find time I'll rewrite this to be fully streaming as well

function QuerystringParser() {
  this.buffer = '';
}
exports.QuerystringParser = QuerystringParser;

QuerystringParser.prototype.write = function(buffer) {
  this.buffer += buffer.toString('ascii');
  return buffer.length;
};

QuerystringParser.prototype.end = function() {
  var self = this, data = this.buffer;
	if (data && data.length) {
		data.split(/[&?]/).forEach(function(str){
			str.replace(/^([^=]+)(?:=(.*))?$/, function(_,key,val){
				self.onField(urlDec(key), urlDec(val));
			});
		});
	}
  this.buffer = '';
  this.onEnd();
};

function urlDec(s) {
	s = (s) ? s.replace(/\+/g, ' ') : '';
	try {
		return decodeURIComponent(s);
	} catch(e) {
		return unescape(s);
	}
}
