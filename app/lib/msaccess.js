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
function lib_msaccess() {
	
	var msaccess, fs = require('fs'), path = require('path'), connections = {};
	
	function Connection(name,db_file) {
		this._file = db_file;
		this._cstr = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source='" + path(db_file) + "'";
		var conn;
		if (Object.exists(connections,name)) {
			conn = connections[name];
		} else {
			conn = new ActiveXObject("ADODB.Connection");
		}
		if (conn.State == 0) conn.Open(this._cstr);
		this._conn = conn;
	}
	
	Connection.prototype = {
		query: function(query,params,func) {
			if (vartype(params) == 'function') {
				func = params;
				params = [];
			}
			var rs, conn = this._conn, q = fn_parseQuery(query,params);
			try {
				rs = conn.Execute(q);
			} catch (e) {
				throw(new Error('SQL Statement Could not be executed. ' + e.description + '\r\n' + q));
			}
			var abort = false, i = 0;
			while (!rs.EOF && !abort) {
				var rec = {};
				Enumerator.each(rs.Fields,function(i,field){
					rec[field.Name] = fn_parse(field.Value);
				});
				abort = ( func(rec,i++) === false );
				rs.MoveNext();
			}
			rs.Close();
		},
		exec: function(query,params,b) {
			var i, conn = this._conn, q = fn_parseQuery(query,params);
			try {
				conn.Execute(q,i,128);
			} catch (e) {
				throw(new Error('SQL Statement Could not be executed. ' + e.description + '\r\n' + q));
			}
			if (b) {
				if (String(q).startsWith('INSERT')) {
					q = 'SELECT @@IDENTITY AS [val]';
				} else {
					q = 'SELECT @@ROWCOUNT AS [val]';
				}
				this.query(q,function(rec){ i = rec.val })
				return String.parseInt(i);
			}
		},
		close: function() {
			var conn = this._conn;
			if (conn.State != 0) conn.Close();
		}
	}
	
	function fn_parseQuery(q,arr) {
		var s = String(q), a = [], i=0, d = false, n = '';
		while (i < s.length) {
			var c1 = s.charAt(i), c2 = s.charAt(i + 1) || '';
			if (!d) {
				if (c1 == "'") {
					a.push({d:n,t:0}); n = ''; d = true;
				} else {
					n += c1;
				}
			} else {
				if (c1+c2 == "''") {
					n += c2; i++;
				} else
				if (c1 == "'") {
					a.push({d:n,t:1}); n = ''; d = false;
				} else {
					n += c1;
				}
			}
			i++;
		}
		if (n.length) a.push({d:n,t:0});
		var r = '';
		for (var i=0;i<a.length;i++) {
			if (a[i].t == 0) {
				a[i].d = fn_subs(a[i].d,arr);
				a[i].d = a[i].d.replace(/\$GUID\('(\{[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\})'\)/ig,'{guid $1}');
				r += a[i].d;
			} else {
				r += "'" + a[i].d + "'";
			}
		}
		r = r.replace()
		return r;
	}
	
	function fn_subs(str,arr) {
		var s = str;
		s = s.replace(/\$(\d+)/g,function(s,i){
			i = parseInt(i) - 1;
			if (i < arr.length) return fn_toString(arr[i]);
			return s;
		});
		return s;
	}
	
	function fn_parse(o) {
		if (typeof o == 'date') {
			return new Date(Date.parse(o));
		}
		return o;
	}
	
	function fn_escape(str) {
		return String(str).replace(/'/g,"''");
	}
	
	function fn_fdate(d) {
		return Date.format(d,"{yyyy}-{mm}-{dd} {hh}:{nn}:{ss}");
	}
	
	function fn_toString(v) {
		var r;
		switch (vartype(v)) {
			case 'null': case 'undefined':
				r = "NULL";
			break;
			case 'date':
				r = "'" + fn_fdate(v) + "'";
			break;
			case 'number':
				r = (isFinite(v)) ? v.toString() : "NULL";
			break;
			case 'boolean':
				r = (v) ? "1" : "0";
			break;
			default:
				r = "'" + fn_escape(v) + "'";
			break;
		}
		return r;
	};
	
	function fn_open(name) {
		var file = '/data/' + fs.escape(name) + '.mdb'
			, isNew = false;
		if (!fs.fileExists(file)) {
			isNew = true;
			fs.copyFile('/data/new.dat',file);
		}
		var conn = new Connection(name,file);
		if (isNew) {
			var q = "CREATE TABLE [col] ([col_id] COUNTER CONSTRAINT [pk_col_id] PRIMARY KEY, [col_name] TEXT(255), [status] TEXT(50))"
			conn.exec(q);
			var q = "CREATE TABLE [doc] ([doc_id] COUNTER CONSTRAINT [pk_doc_id] PRIMARY KEY, [col] INT, [guid] GUID)"
			conn.exec(q);
			var q = "CREATE TABLE [rec] ([rec_id] COUNTER CONSTRAINT [pk_rec_id] PRIMARY KEY, [doc] INT, [name] TEXT(255), [type] TEXT(255), [value] MEMO)"
			conn.exec(q);
		}
		return conn;
	}
	
	app.on('destroy',function() {
		Object.each(connections,function(name,conn){
			if (conn.State != 0) conn.Close();
		});
	});
	
	
	
	msaccess = {
		open:fn_open
	};
	
	return msaccess;

}
