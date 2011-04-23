/**
 * Binary Class
 *
 * This class is a wrapper for an ActiveX "stream" object that
 * can be used to represent binary data, unicode strings, etc.
 * It supports conversion between encodings and output as an
 * array of integers or various string formats.
 *
 * Example Usage: (new operator is not required)
 * var bin = new Binary('68656c6c6f', 'hex');
 * bin.toString('ascii'); //returns 'hello'
 * bin.length(); //returns 5
 * bin.toArray(); //returns [104, 101, 108, 108, 111]
 * var bin = new Binary('\uC548\uB155\uD558\uC138\uC694', 'utf16');
 * bin.length(); //returns 10 (10 bytes)
 * bin.toString().length; //returns 5 (5 chars)
 *
 */
function Binary(data, enc) {
  
  if (!Binary.prototype.toArray) {
    Binary.prototype = _Binary_proto();
  }
  
  if (!(this instanceof Binary)) {
    return new Binary(data,enc);
  }

  this._stream = new ActiveXObject("ADODB.Stream");
  this.bomOffset = 0;
  this._stream.open();
  
  var util = Binary.prototype.util
    , type = util.vartype(data);
  
  enc = this.defaultEnc = util.parseEncType(enc);
  
  if (type == 'unknown') {
    //assume ado binary
    this.writeBin(data);
  } else
  if (type == 'array') {
    //array of octets as integers
    this.writeBin(util.hex2bin(util.arr2hex(data)));
  } else
  if (type == 'string' && enc == 'hex') {
    //hex string
    this.writeBin(util.hex2bin(data));
  } else
  if (type == 'string' && enc == 'base64') {
    //base64 encoded string
    this.writeBin(util.hex2bin(util.bsf2hex(data)));
  } else
  if (type == 'string') {
    this.writeText(data, enc);
  }
  
  return this;
  
}

function _Binary_proto() {
  
  var xml = new ActiveXObject('Microsoft.XMLDOM')
    , chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    , adTypeBinary = 1
    , adTypeText = 2;
  
  function hexChar(i) {
    return (i < 16) ? '0' + i.toString(16) : i.toString(16);
  }
  function hexSani(hex) {
    return String(hex).replace(/^((?:[A-F0-9]{2})*)(.*)$/ig,'$1');
  }
  
  var md5 = {
    hash: function(hex) {
      var len = hex.length * 4, x = this.toInt(hex);
      x[len >> 5] |= 0x80 << ((len) % 32);
      x[(((len + 64) >>> 9) << 4) + 14] = len;
      var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e, f, g, h, l = x.length;
      for (var i = 0; i < l; i += 16) {
        e = a; f = b; g = c; h = d;
        a = this.md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936); d = this.md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
        c = this.md5_ff(c, d, a, b, x[i+ 2], 17, 606105819); b = this.md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
        a = this.md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897); d = this.md5_ff(d, a, b, c, x[i+ 5], 12, 1200080426);
        c = this.md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341); b = this.md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
        a = this.md5_ff(a, b, c, d, x[i+ 8], 7 , 1770035416); d = this.md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
        c = this.md5_ff(c, d, a, b, x[i+10], 17, -42063); b = this.md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
        a = this.md5_ff(a, b, c, d, x[i+12], 7 , 1804603682); d = this.md5_ff(d, a, b, c, x[i+13], 12, -40341101);
        c = this.md5_ff(c, d, a, b, x[i+14], 17, -1502002290); b = this.md5_ff(b, c, d, a, x[i+15], 22, 1236535329);
        a = this.md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510); d = this.md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
        c = this.md5_gg(c, d, a, b, x[i+11], 14, 643717713); b = this.md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
        a = this.md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691); d = this.md5_gg(d, a, b, c, x[i+10], 9 , 38016083);
        c = this.md5_gg(c, d, a, b, x[i+15], 14, -660478335); b = this.md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
        a = this.md5_gg(a, b, c, d, x[i+ 9], 5 , 568446438); d = this.md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
        c = this.md5_gg(c, d, a, b, x[i+ 3], 14, -187363961); b = this.md5_gg(b, c, d, a, x[i+ 8], 20, 1163531501);
        a = this.md5_gg(a, b, c, d, x[i+13], 5 , -1444681467); d = this.md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
        c = this.md5_gg(c, d, a, b, x[i+ 7], 14, 1735328473); b = this.md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
        a = this.md5_hh(a, b, c, d, x[i+ 5], 4 , -378558); d = this.md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
        c = this.md5_hh(c, d, a, b, x[i+11], 16, 1839030562); b = this.md5_hh(b, c, d, a, x[i+14], 23, -35309556);
        a = this.md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060); d = this.md5_hh(d, a, b, c, x[i+ 4], 11, 1272893353);
        c = this.md5_hh(c, d, a, b, x[i+ 7], 16, -155497632); b = this.md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
        a = this.md5_hh(a, b, c, d, x[i+13], 4 , 681279174); d = this.md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
        c = this.md5_hh(c, d, a, b, x[i+ 3], 16, -722521979); b = this.md5_hh(b, c, d, a, x[i+ 6], 23, 76029189);
        a = this.md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487); d = this.md5_hh(d, a, b, c, x[i+12], 11, -421815835);
        c = this.md5_hh(c, d, a, b, x[i+15], 16, 530742520); b = this.md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
        a = this.md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844); d = this.md5_ii(d, a, b, c, x[i+ 7], 10, 1126891415);
        c = this.md5_ii(c, d, a, b, x[i+14], 15, -1416354905); b = this.md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
        a = this.md5_ii(a, b, c, d, x[i+12], 6 , 1700485571); d = this.md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
        c = this.md5_ii(c, d, a, b, x[i+10], 15, -1051523); b = this.md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
        a = this.md5_ii(a, b, c, d, x[i+ 8], 6 , 1873313359); d = this.md5_ii(d, a, b, c, x[i+15], 10, -30611744);
        c = this.md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380); b = this.md5_ii(b, c, d, a, x[i+13], 21, 1309151649);
        a = this.md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070); d = this.md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
        c = this.md5_ii(c, d, a, b, x[i+ 2], 15, 718787259); b = this.md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
        a = this.safe_add(a, e); b = this.safe_add(b, f); c = this.safe_add(c, g); d = this.safe_add(d, h);
      }
      return this.fromInt(Array(a, b, c, d));
    },
    toInt: function(hex) {
      var len = Math.floor(hex.length / 2), arr = Array(len >> 2);
      for(var i = 0; i < arr.length; i++) {
        arr[i] = 0;
      }
      var i = 0;
      hex.replace(/../g, function(ch){ 
        arr[i>>5] |= (parseInt(ch, 16) & 0xFF) << (i%32);
        i += 8;
      });
      return arr;
    },
    fromInt: function(arr) {
      var hex = [], len = arr.length * 32;
      for(var i = 0; i < len; i += 8) {
        hex.push(hexChar((arr[i>>5] >>> (i % 32)) & 0xFF));
      }
      return hex.join('');
    },
    safe_add: function(x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    },
    bit_rol: function(num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt));
    },
    md5_cmn: function(q, a, b, x, s, t) {
      return this.safe_add(this.bit_rol(this.safe_add(this.safe_add(a, q), this.safe_add(x, t)), s),b);
    },
    md5_ff: function(a, b, c, d, x, s, t) {
      return this.md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    },
    md5_gg: function(a, b, c, d, x, s, t) {
      return this.md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    },
    md5_hh: function(a, b, c, d, x, s, t) {
      return this.md5_cmn(b ^ c ^ d, a, b, x, s, t);
    },
    md5_ii: function(a, b, c, d, x, s, t) {
      return this.md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }
  };
  
  var util = {
    vartype: function(obj) {
      var type = (obj === null) ? 'null' : typeof obj;
      if (obj instanceof Object) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
      }
      return (type == 'object') ? 'unknown' : type;
    },
    parseEncType: function(type) {
      var t = String(type).replace(/-/g, '').toLowerCase();
      if (t == 'hex' || t == 'base64') {
        return t;
      } else
      if (t == 'utf16le') {
        return 'unicode'; //unicode little-endian (MS CP-1200)
      } else
      if (t == 'ascii' || t == 'us-ascii' || t == 'iso8859') {
        return 'iso-8859-1'; //subset of MS CP-1252
      } else
      if (t == 'unicode' || t == 'ucs2' || t == 'utf16' || t == 'utf16be') {
        return 'utf-16be'; //unicode big-endian / UCS-2 (MS CP-1201)
      } else {
        return 'utf-8'; //MS CP-65001
      }
    },
    bin2hex: function(bin) {
      var el = xml.createElement('node');
      el.dataType = 'bin.hex';
      el.nodeTypedValue = bin;
      return String(el.text);
    },
    hex2bin: function(hex) {
      hex = hexSani(hex);
      var el = xml.createElement('node');
      el.dataType = 'bin.hex';
      el.text = hex;
      return el.nodeTypedValue;
    },
    hex2arr: function(hex) {
      var arr = [];
      hex = hexSani(hex);
      hex.replace(/../g, function(ch){ 
        arr.push(parseInt(ch, 16)); 
      });
      return arr;
    },
    arr2hex: function(arr) {
      var hex = [], len = arr.length;
      for (var i=0; i<len; i++) {
        var str = hexChar(arr[i]);
        hex[i] = (str.length == 1) ? '0' + str : str;
      }
      return hex.join('');
    },
    hex2bsf: function(hex) {
      var arr = [];
      hex = hexSani(hex);
      hex.replace(/(..)(..)?(..)?/g, function(all,h1,h2,h3){ 
        var a = (h1) ? parseInt(h1, 16) : 0;
        var b = (h2) ? parseInt(h2, 16) : 0;
        var c = (h3) ? parseInt(h3, 16) : 0;
        var b1 = ( a >> 2 ) & 0x3F;
        var b2 = ( ( a & 0x3 ) << 4 ) | ( ( b >> 4 ) & 0xF );
        var b3 = ( ( b & 0xF ) << 2 ) | ( ( c >> 6 ) & 0x3 );
        var b4 = c & 0x3F;
        if (!h2) {
          b3 = b4 = 64;
        } else
        if(!h3) {
          b4 = 64;
        }
        arr.push(chars.charAt(b1) + chars.charAt(b2) + chars.charAt(b3) + chars.charAt(b4));
      });
      return arr.join('');
    },
    bsf2hex: function(str) {
      var arr = [], i = 0, p = 0;
      str = str.replace(/^([A-Z0-9+\/]{2,}={0,2})?(.*)$/ig,'$1');
      str = str.replace(/[=]*$/,function(s){ p = s.length; return ''; });
      while(i < str.length) {
        var b1 = chars.indexOf( str.charAt(i++) );
        var b2 = chars.indexOf( str.charAt(i++) );
        var b3 = chars.indexOf( str.charAt(i++) );
        var b4 = chars.indexOf( str.charAt(i++) );
        var a = ( ( b1 & 0x3F ) << 2 ) | ( ( b2 >> 4 ) & 0x3 );
        var b = ( ( b2 & 0xF  ) << 4 ) | ( ( b3 >> 2 ) & 0xF );
        var c = ( ( b3 & 0x3  ) << 6 ) | ( b4 & 0x3F );
        var s = hexChar(a) + hexChar(b) + hexChar(c);
        s = (i < str.length) ? s : s.substring(0,6 - (2 * p));
        arr.push(s);
      }
      return arr.join('');
    }
  };
  
  return {
    util: util,
    length: function(){
      return this._stream.size - this.bomOffset;
    },
    readBin: function(offset, count) {
      var stream = this._stream;
      stream.position = 0;
      stream.type = adTypeBinary;
      stream.position = (offset) ? offset + this.bomOffset : this.bomOffset;
      return (count) ? stream.read(count) : stream.read();
    },
    writeBin: function(data) {
      var stream = this._stream;
      stream.position = 0;
      stream.type = adTypeBinary;
      stream.position = stream.size;
      if (data !== null) {
        stream.write(data);
      }
    },
    readText: function(enc) {
      var stream = this._stream;
      stream.position = 0;
      stream.type = adTypeText;
      stream.charset = enc;
      return stream.readtext();
    },
    writeText: function(data, enc) {
      var stream = this._stream;
      this.bomOffset = (enc == 'utf-8') ? 3 : (enc == 'unicode') ? 2 : 0;
      stream.type = adTypeText;
      stream.charset = enc;
      //res.die([String(data), enc]);
      stream.writetext(String(data));
      //res.die([this.bomOffset, this._stream.size]);
    },
    md5: function() {
      return new Binary(md5.hash(this.toString('hex')),'hex');
    },
    toArray: function() {
      return util.hex2arr(util.bin2hex(this.readBin()));
    },
    toJSON: function() {
      return "[Binary('" + this.toString('hex') + "','hex')]";
    },
    toString: function(enc) {
      enc = (enc) ? util.parseEncType(enc) : this.defaultEnc;
      if (enc == 'hex') {
        return util.bin2hex(this.readBin());
      } else
      if (enc == 'base64') {
        return util.hex2bsf(util.bin2hex(this.readBin()));
      } else {
        return this.readText(enc);
      }
    },
    slice: function(offset, count) {
      return new Binary(this.readBin(offset, count));
    },
    append: function(data, enc) {
      if (!(data instanceof Binary)) {
        data = new Binary(data, enc);
      }
      this.writeBin(data.readBin());
      return this;
    }
  };
  
}
