/*!
 * Session Library
 *
 * Uses cookie-based identification tokens to persist session state between HTTP requests.
 * Usage:
 * var session = lib('session').init(); //Create new session instance
 *
 * Arguments can be passed into the init method with a comma/space separated list of options:
 * var session = lib('session').init('longterm expires:30d');
 *
 * Cookie Types:
 *  longterm - has an explicit (far-distant) expiry so it is preserved between visits
 *  shortterm [default] - cookie is discarded when browser is closed
 *
 * Session Data Expiry:
 * Each instance of a session can have a specific expiry that is different from it's underlying
 * cookie expiry. The cookie expiry represents an upper bound (a session of a given type can not
 * expire *later* than the cookie it uses) but you can explicitly specify an expiry for your data.
 * The format is expires:[number][d/h/m] (days/hours/minutes).
 *
 * var session = lib('session').init('expires:30m'); //Short-term session that expires in 30 minutes
 *
 * Namespacing:
 * Session Data can be namespaced to avoid collisions and to allow data within different namespaces to
 * have different expires. For example, a login controller may save its data to a session instance with
 * namespace 'auth' and a 30 minute expires, while another controller may store it's session data with a
 * different namespace and longer expires.
 *
 * var session = lib('session').init('namespace:auth expires:30m');
 *
 * Note:
 * Instances with different cookie-types are automatically in different namespaces.
 *
 * By default session data is lazy-loaded meaning the data is first read from the underlying data-
 * store when you first access it rather than when you initialize it. It is not written back to the
 * data-store until the end of the request (or when session.flush() is called). Session data can be
 * re-loaded from the data-store (for instance during a long request like a file-upload) by calling
 * session.reload() at any time.
 *
 */
if (!this.lib_session) this.lib_session = lib_session;
function lib_session() {

  var RE_TOKEN = /^[0-9a-f]{32}$/i;

  var cache = {}, json = lib('json');
  var datastore = (app.cfg('session/default_datastore') == 'database') ? 'database' : 'memory';

  function getCookieName(type) {
    if (type == 'longterm') {
      return 'LTSID';
    } else {
      return 'STSID';
    }
  }

  function generateSessionToken() {
    return String.repeat('.', 32).replace(/./g, function() {
      return Number.random(0, 15).toString(16);
    });
  }

  function getSessionObject(inst) {
    var type = inst.type;
    if (cache[type]) {
      return cache[type];
    }
    var key = getCookieName(type);
    var token = req.cookies(key);
    token = RE_TOKEN.test(token) ? token : null;
    if (!token || type == 'longterm') {
      token = token || generateSessionToken();
      if (type == 'longterm') {
        res.cookies(key, {value: token, expires: Date.today().add({months: 12})});
      } else {
        res.cookies(key, token);
      }
    }
    var session = cache[type] = {token: token};
    bind('destroy', function() {
      controllers[datastore].saveAll(session);
    });
    return session;
  }

  function newCollection(session, data) {
    return new Collection(data);
  }

  var controllers = {
    memory: {
      'load': function(session, inst) {
        var token = session.token;
        var data = server.appvars('session:' + token + ':' + inst.namespace);
        session.lastAccess = server.appvars('session:last-access:' + token);
        if (session.lastAccess) {
          server.appvars('session:last-access:' + token, Date.now());
        }
        if (session.lastAccess && (!inst.oldest || inst.oldest < session.lastAccess)) {
          data = data || {};
        } else {
          data = {};
        }
        if (!session.namespaces) session.namespaces = {};
        return session.namespaces[inst.namespace] = newCollection(session, data);
      },
      'saveAll': function(session) {
        var self = controllers.memory;
        forEach(session.namespaces, function(namespace, collection) {
          self.save(session, namespace, collection);
        });
      },
      'save': function(session, namespace, collection) {
        if (collection && collection.isDirty()) {
          server.appvars('session:' + session.token + ':' + namespace, collection.toObject());
          collection.clearDirty();
        }
        if (!session.lastAccess) {
          session.lastAccess = Date.now();
          server.appvars('session:last-access:' + session.token, session.lastAccess);
        }
      }
    },
    database: {
      'load': function(session, inst) {
        var self = controllers.database;
        var db = self.db || (self.db = lib('msaccess').open(app.cfg('session/database') || 'session', dbInit));
        var token = session.token, data;
        if (!session.lastAccess) {
          var meta = db.query("SELECT * FROM [session] WHERE [guid] = CAST_GUID($1)", [token]).getOne();
          if (meta) {
            session.lastAccess = meta.last_access;
          }
        }
        if (session.lastAccess && (!inst.oldest || inst.oldest < session.lastAccess)) {
          var rec = db.query("SELECT * FROM [session_data] WHERE [guid] = CAST_GUID($1) AND [namespace] = $2", [token, inst.namespace]).getOne();
          if (rec) {
            data = json.parse(rec.data);
          }
        }
        if (!data) {
          data = {};
        }
        if (!session.namespaces) session.namespaces = {};
        return session.namespaces[inst.namespace] = newCollection(session, data);
      },
      'saveAll': function(session) {
        var self = controllers.database;
        forEach(session.namespaces, function(namespace, collection) {
          self.save(session, namespace, collection);
        });
      },
      'save': function(session, namespace, collection) {
        var self = controllers.database;
        var db = self.db || (self.db = lib('msaccess').open(app.cfg('session/database') || 'session', dbInit));
        //Save data if collection has been modified
        if (collection && collection.isDirty()) {
          var stringified = json.stringify(collection.toObject());
          var sql = "UPDATE [session_data] SET [data] = $3 WHERE [guid] = CAST_GUID($1) AND [namespace] = $2";
          var num = db.exec(sql, [session.token, namespace, stringified], true);
          if (!num) {
            sql = "INSERT INTO [session_data] ([guid], [namespace], [data]) VALUES (CAST_GUID($1), $2, $3)";
            db.exec(sql, [session.token, namespace, stringified]);
          }
          collection.clearDirty();
        }
        //Update Last-Accessed (whether we saved any data or not)
        if (!session.lastAccessUpdated) {
          var sql = "UPDATE [session] SET [last_access] = NOW() WHERE [guid] = CAST_GUID($1)";
          var num = db.exec(sql, [session.token], true);
          if (!num) {
            sql = "INSERT INTO [session] ([guid], [ip_addr], [http_ua], [created], [last_access]) VALUES (CAST_GUID($1), $2, $3, NOW(), NOW())";
            db.exec(sql, [session.token, server.vars('ipaddr'), req.headers('user-agent')]);
          }
          session.lastAccess = Date.now();
          session.lastAccessUpdated = true;
        }
      }
    }
  };

  function dbInit(conn) {
    var q = "CREATE TABLE [session] ([guid] GUID CONSTRAINT [pk_guid] PRIMARY KEY, [ip_addr] TEXT(15), [http_ua] MEMO, [created] DATETIME, [last_access] DATETIME)";
    conn.exec(q);
    var q = "CREATE TABLE [session_data] ([id] INTEGER IDENTITY(1234,1) CONSTRAINT [pk_id] PRIMARY KEY, [guid] GUID, [namespace] TEXT(255), [data] MEMO)";
    conn.exec(q);
  }

  function Session(opts) {
    this.opts = opts;
    this.init();
  }

  Session.prototype = {
    init: function() {
      this.type = (this.opts.longterm) ? 'longterm' : 'shortterm';
      this.namespace = this.opts.namespace || '';
      var m, units = {d: 'days', h: 'hours', m: 'minutes'};
      if (this.opts.expires && (m = this.opts.expires.match(/^(\d+)([dhm])$/))) {
        var u = units[m[2]], param = {};
        param[u] = 0 - Number.parseInt(m[1]);
        this.oldest = Date.now().add(param);
      }
    },
    load: function() {
      var session = getSessionObject(this);
      return controllers[datastore].load(session, this);
    },
    getCollection: function() {
      var session = getSessionObject(this);
      return session.namespaces && session.namespaces[this.namespace] || this.load();
    },
    reload: function() {
      var session = getSessionObject(this);
      if (session.namespaces) {
        session.namespaces[this.namespace] = null;
      }
    },
    access: function() {
      var collection = this.getCollection();
      return collection.access.apply(collection, arguments);
    },
    clear: function() {
      var collection = this.getCollection();
      return collection.clear();
    },
    flush: function() {
      var session = getSessionObject(this);
      if (session.namespaces && session.namespaces[this.namespace]) {
        controllers[datastore].save(session, this.namespace, session.namespaces[this.namespace]);
      }
    }
  };

  return {
    init: function(opts) {
      var options = {};
      if (vartype(opts, 'string')) {
        opts = opts.w();
      }
      if (vartype(opts, 'array')) {
        opts.each(function(i, opt) {
          var m = opt.match(/^([\w-]+)(?:[:=]([^\s]+))?$/);
          if (m && m[2]) {
            options[m[1]] = m[2];
          } else {
            options[opt] = 'true';
          }
        });
      } else
      if (vartype(opts, 'object')) {
        Object.append(options, opts);
      }
      var session = new Session(options);
      var accessor = function() {
        return session.access.apply(session, arguments);
      };
      accessor.reload = session.reload.bind(session);
      accessor.clear = session.clear.bind(session);
      accessor.flush = session.flush.bind(session);
      accessor.getToken = function() {
        return getSessionObject(session).token;
      };
      return accessor;
    }
  };

}
