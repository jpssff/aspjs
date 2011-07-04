/**
 * Microsoft Access SQL Adapter: This class presents an abstraction layer
 * for querying Microsoft Access files (.mdb) located in the /data folder.
 * The interface exposes several simple functions that accept SQL-like
 * queries and convert them into safe, compatible SQL to be executed
 * on or queried against the database.
 *
 * Databases are requested by name (not by filename) and the database file 
 * will be created if it does not already exist.
 *
 *
 */
if (!this.lib_msaccess) this.lib_msaccess = lib_msaccess;
function lib_msaccess() {

  var util = lib('util');
  var dbExt = app.cfg('database/ext') || '.mdb';
  var msaccess, fs = sys.fs, connections = {};

  function Connection(name, db_file) {
    this._file = db_file;
    this._cstr = 'Provider=Microsoft.Jet.OLEDB.4.0;Data Source="' + sys.mappath(db_file) + '"';
    var conn;
    if (Object.exists(connections, name)) {
      conn = connections[name];
    } else {
      conn = new ActiveXObject("ADODB.Connection");
    }
    if (conn.state == 0) {
      try {
        conn.open(this._cstr);
      } catch(e) {
        if (e.description.startsWith('Could not find file')) {
          var cat = new ActiveXObject("ADOX.Catalog");
          cat.create(this._cstr);
          this.isNew = true;
          conn.open(this._cstr);
        } else {
          throw e;
        }
      }
    }
    this._conn = conn;
  }
  
  Connection.prototype = {
    query: function(str, params, func) {
      if (arguments.length == 1) {
        params = [];
      }
      if (vartype(params) == 'function') {
        func = params;
        params = [];
      }
      var rs, conn = this._conn, sql = fn_BuildSQL(str, params);
      //Build Query Object
      var query = function(func) {
        if (func) return query.each(func);
      };
      query.sql = function() {
        return sql;
      };
      query.each = function(func) {
        if (app.debug) sys.log(sql, 'msaccess');
        try {
          rs = conn.execute(sql);
        } catch (e) {
          throw new Error('SQL Statement Could not be executed. ' + e.description + '\r\n' + sql);
        }
        var abort = false, i = 0;
        //TODO: Performance Tune (looping vs. get all)
        if (rs.state) {
          while (!rs.eof && !abort) {
            var rec = {};
            util.enumerate(rs.fields, function(i, field) {
              rec[field.name] = fn_fromADO(field.value);
            });
            abort = ( func(rec, i++) === false );
            rs.movenext();
          }
          rs.close();
        }
        return query;
      };
      query.getOne = function() {
        var rec;
        query.each(function(r) {
          rec = r;
          return false;
        });
        return rec;
      };
      query.getAll = function() {
        var arr = [];
        query.each(function(r) {
          arr.push(r);
        });
        return arr;
      };
      //Apply passed in function
      if (func) {
        query.each(func);
      }
      return query;
    },
    exec: function(str, params, b) {
      var i, conn = this._conn, sql = fn_BuildSQL(str, params), rs;
      if (app.debug) sys.log(sql, 'msaccess');
      try {
        if (b) {
          i = executeSqlAndReturnNumRowsAffected(conn, sql);
        } else {
          conn.execute(sql, i, 128);
        }
      } catch (e) {
        throw new Error('SQL Statement Could not be executed. ' + e.description + '\r\n' + sql);
      }
      if (b) {
        if (String(sql).startsWith('INSERT')) {
          sql = 'SELECT @@IDENTITY AS [val]';
        } else {
          //sql = 'SELECT @@ROWCOUNT AS [val]';
          return Number.parseInt(i);
        }
        this.query(sql, function(rec) {
          i = rec.val
        });
        return Number.parseInt(i);
      }
    },
    close: function() {
      var conn = this._conn;
      if (conn.state != 0) conn.close();
    }
  };
  
  function fn_BuildSQL(q, arr) {
    q = String(q),now = Date.now(), i = 0;
    var re = /('(''|[^'])*'|\[(\\.|[^\]])*\]|\$\d+|\?|[A-Z_]+\(\))/gim;
    arr = arr || [];
    q = q.replace(re, function(s) {
      if (s == "NOW()") {
        return '#' + fn_SQLDate(now) + '#';
      }
      var c = s.substr(0, 1);
      if (c == "$") {
        i = Number.parseInt(s.substr(1));
        s = fn_SQLVal(arr[i - 1]);
      } else
      if (c == "?") {
        i ++;
        s = fn_SQLVal(arr[i - 1]);
      } else
      if (c == "'") {
        //Quoted String
      }
      return s;
    });
    q = q.replace(/SELECT\s+(.*?)\s+LIMIT\s+(\d+)/ig, 'SELECT TOP $2 $1');
    q = q.replace(/CAST_HEX\('((?:[0-9a-f]{2})+)'\)/ig, '0x$1');
    q = q.replace(/CAST_DATE\('(.+?)'\)/ig, function(_, date) {
      return fn_SQLVal(Date.fromString(date));
    });
    q = q.replace(/CAST_GUID\('(\{[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\})'\)/ig, '{guid $1}');
    q = q.replace(/CAST_GUID\('([\da-f]{8})([\da-f]{4})([\da-f]{4})([\da-f]{4})([\da-f]{12})'\)/ig, '{guid {$1-$2-$3-$4-$5}}');
    return q;
  }
  
  //Convert Value to SQL String
  function fn_SQLVal(v) {
    var r;
    switch (vartype(v)) {
      case 'null':
      case 'undefined':
        r = "NULL";
        break;
      case 'date':
        r = "#" + fn_SQLDate(v) + "#";
        break;
      case 'number':
        r = (isFinite(v)) ? v.toString() : "NULL";
        break;
      case 'boolean':
        r = (v) ? "1" : "0";
        break;
      default:
        r = "'" + fn_SQLEsc(v) + "'";
        break;
    }
    return r;
  }
  
  function fn_SQLDate(d) {
    //Dates are stored in DB as UTC
    return Date.format(d, "{yyyy}-{mm}-{dd} {HH}:{nn}:{ss}", true);
  }
  
  function fn_SQLEsc(str) {
    return String(str).replace(/'/g, "''");
  }
  
  //Convert from ADO Data Type
  function fn_fromADO(o) {
    if (typeof o == 'date') {
      //Dates are stored in DB as UTC
      return Date.fromUTCString(o);
    }
    return o;
  }

  function fn_open(name, fn_init) {
    var file = '~/data/db/' + fs.escape(name) + dbExt;
    var conn = new Connection(name, file);
    if (conn.isNew && fn_init) {
      fn_init(conn);
    }
    return conn;
  }

  bind('destroy', function() {
    Object.each(connections, function(name, conn) {
      if (conn.state != 0) conn.close();
    });
  });


  msaccess = {
    open:fn_open
  };
  
  return msaccess;

}
