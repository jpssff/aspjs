if (!this.lib_util) this.lib_util = lib_util;
function lib_util() {

  var REG_EMAIL = /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
  var REG_GUID = /^\{[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\}$/i;

  /**
   * Get a specific date based on a starting date and adding a number of weeks (used when calculating
   * daylight savings time to get correct timezone offsets)
   *
   * Example:
   * Get the second Thursday of May 2010
   *  getDateByWeekdayAfter(2010,5,1,2,'thu')
   *
   */
  function getDateByWeekdayAfter(yy,mm,dd,num,weekday) {
    var r, d = new Date(yy,mm - 1,dd), i_day = d.getDate()
      , a = ['sun','mon','tue','wed','thu','fri','sat'], i_count = 0;
    while (i_day < 32 && i_count < num) {
      d.setDate(i_day);
      if (d.getDay() == a.indexOf(weekday)) i_count ++;
      i_day ++;
    }
    if (i_day < 32) r = d;
    return r;
  }

  return {
    /**
     * Parse URL-Encoded string of parameters (x-www-form-urlencoded)
     *
     * @param {String} data URL-Encoded string
     * @returns {Object}
     */
    parseQueryString: function(data) {
      var obj = {};
      if (data && data.length > 1) {
        data.split(/[&\?]/).each(function(i,str){
          str.replace(/^([^=]+)(?:=(.*))?$/,function(_,key,val){
            key = urlDec(key);
            if (Object.exists(obj, key)) {
              if (vartype(obj[key]) != 'array') {
                obj[key] = [obj[key]];
              }
              obj[key].push(urlDec(val));
            } else {
              obj[key] = urlDec(val);
            }
          });
        });
      }
      return obj;
    },
    /**
     * Build URL-Encoded string from a set of named parameters (object)
     *
     * @param {Object} obj
     */
    buildQueryString: function(obj) {
      var arr = [];
      Object.each(obj,function(n, val){
        if (vartype(val) == 'array') {
          arr.each(function(i, val) {
            arr.push(String.urlEnc(n) + '=' + String.urlEnc(val));
          });
        } else {
          arr.push(String.urlEnc(n) + '=' + String.urlEnc(val));
        }
      });
      return arr.join('&');
    },
    /**
     * Parse HTTP headers from string
     *
     * @param {String} data Raw HTTP headers
     */
    parseHeaders: function(data) {
      var obj = {};
      data.split(/[\r\n]+/).each(function(i,str){
        str.replace(/^([^:]+):\s*(.*)$/,function(_,key,val){
          if (Object.exists(obj, key)) {
            if (vartype(obj[key]) != 'array') {
              obj[key] = [obj[key]];
            }
            obj[key].push(val);
          } else {
            obj[key] = val;
          }
        });
      });
      return obj;
    },
    /**
     * Parameter Collection wraps a Collection exposing an add method that handles multiple items of
     * the same name by appending an index to the key. The object passed in is assumed to contain
     * multiple values for a given key if the value is an array.
     *
     * @param {Object} [data] An object containing key-value pairs
     * @returns {Collection}
     */
    newParamCollection: function(data) {
      var col = new Collection(), re = /\[(\d*)\]$/;
      col.howMany = function(key) {
        var count = 0;
        col.each(function(n, item){
          n = n.replace(re,'').toUpperCase();
          if (n == key.toUpperCase()) {
            count ++;
          }
        });
        return count;
      };
      col.add = function(n, item) {
        n = n.replace(re,''), i = col.howMany(n);
        if (i == 0) {
          col(n, item);
        } else
        if (i == 1) {
          col(n + '[0]', col.remove(n));
          col(n + '[1]', item);
        } else {
          col(n + '[' + count + ']', item);
        }
      };
      if (data) {
        Object.each(data, function(n, item){
          if (item instanceof Array) {
            item.each(function(i, item){
              col.add(n, item);
            });
          } else {
            col.add(n, item);
          }
        });
      }
      return col;
    },
    /**
     * Enumerate an ActiveX Collection
     *
     */
    enumerate: function(col, fn) {
      var i = 0;
      for(var e=new Enumerator(col);!e.atEnd();e.moveNext()) {
        if (fn.call(col,i++,e.item()) === false) break;
      }
    },
    /**
     * Check Email Address Syntax
     *
     */
    isEmail: function(str) {
      return !!String(str).match(REG_EMAIL);
    },
    /**
     * Randomly generate a Globally Unique Identifier
     *
     */
    getGUID: function() {
      return String("##-#-#-#-###").replace(/#/g, function() {
        return ('0000' + (Math.random() * 0x10000).toString(16)).slice(-4);
      });
    },
    /**
     * Check GUID Syntax
     *
     */
    isGUID: function(str) {
      return !!String(str).match(REG_GUID);
    },
    /**
     * XPath Function Generator
     * Returns a getter function that will retrieve items from an object by path. Separator is
     * optional and defaults to slash.
     *
     */
    xpath: function(obj,sep) {
      sep = (sep) ? String(sep) : '/';
      return function(path){
        var val = obj
          , arr = String(path).split(sep);
        while (arr.length) {
          var key = arr.shift();
          if (key && val) {
            val = val[key]
          }
        }
        return val;
      };
    },
    /**
     * Apply timezone to date
     * Default timezone is specified in config or can be passed in to function. Timezone object
     * contains an offset in minutes and optionally daylight savings information.
     *
     */
    applyTimezone: function(date,tzo) {
      if (!tzo) tzo = app.cfg('defaults/timezone');
      var d = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
      if (tzo.dst) {
        var dst_start = getDateByWeekdayAfter(d.getFullYear(),tzo.dst.start[0],tzo.dst.start[1],tzo.dst.start[2],tzo.dst.start[3]);
        dst_start = new Date(dst_start.valueOf() - tzo.offset * 60000 + tzo.dst.start[4] * 60000);
        var dst_end = getDateByWeekdayAfter(d.getFullYear(),tzo.dst.end[0],tzo.dst.end[1],tzo.dst.end[2],tzo.dst.end[3]);
        dst_end = new Date(dst_end.valueOf() - tzo.dst.offset * 60000 + tzo.dst.end[4] * 60000);
        if (d >= dst_start && d < dst_end) {
          d = new Date(d.valueOf() + tzo.dst.offset * 60000);
        } else {
          d = new Date(d.valueOf() + tzo.offset * 60000);
        }
      } else {
          d = new Date(d.valueOf() + tzo.offset * 60000);
      }
      return d;
    }
  };
}
