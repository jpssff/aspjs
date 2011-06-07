/*!
 * Session Library
 *
 * Uses cookie-based identification tokens to persist session state between HTTP requests.
 * Usage:
 * var session = lib('session').init(); //Create new session instance
 *
 * Arguments can be passed into the init method with a comma/space separated list of options:
 * var session = lib('session').init('longterm expiry:30d');
 *
 * Cookie Types:
 *  longterm - has an explicit (far-distant) expiry so it is preserved between visits
 *  shortterm [default] - cookie is discarded when browser is closed
 *
 * Session Data Expiry:
 * Each instance of a session can have a specific expiry that is different from it's underlying
 * cookie expiry. The cookie expiry represents an upper bound (a session of a given type can not
 * expire *later* than the cookie it uses) but you can explicitly specify an expiry for your data.
 * The format is expiry:[number][d/h/m] (days/hours/minutes).
 *
 * var session = lib('session').init('expiry:30m'); //Short-term session that expires in 30 minutes
 *
 * Namespacing:
 * Session Data can be namespaced to avoid collisions and to allow data within different namespaces to
 * have different expiry. For example, a login controller may save its data to a session instance with
 * namespace 'auth' and a 30 minute expiry, while another controller may store it's session data with a
 * different namespace and longer expiry.
 *
 * var session = lib('session').init('namespace:auth expiry:30m');
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
        res.cookies(key, {value: token, expiry: Date.today().add({months: 12})});
      } else {
        res.cookies(key, token);
      }
    }
    bind('destroy', function() {
      inst.flush();
    });
    return cache[type] = {token: token};
  }

  function newCollection(session, data) {
    var collection = new Collection(data);
    collection.on('dirty', function() {
      session.isDirty = true;
    });
    return collection;
  }

  var controllers = {
    memory: {
      'load': function(session) {
        var token = session.token;
        session.data = server.appvars('session:' + token);
        session.lastAccess = server.appvars('session:last-access:' + token);
        if (session.data && session.lastAccess) {
          server.appvars('session:last-access:' + token, Date.now());
        } else {
          session.data = {};
        }
        return session;
      },
      'save': function(session) {
        server.appvars('session:' + session.token, session.data);
        if (!session.lastAccess) {
          session.lastAccess = Date.now();
          server.appvars('session:last-access:' + session.token, session.lastAccess);
        };
      }
    },
    database: {
      'load': function(token) {

      },
      'save': function(token, data) {

      }
    }
  };

  function Session(opts) {
    this.opts = opts;
    this.init();
  }

  Session.prototype = {
    init: function() {
      this.type = (this.opts.longterm) ? 'longterm' : 'shortterm';
      this.namespace = this.opts.namespace || '';
      var m, units = {d: 'days', h: 'hours', m: 'minutes'};
      if (this.opts.expiry && (m = this.opts.expiry.match(/^(\d+)([dhm])$/))) {
        var u = units[m[2]], param = {};
        param[u] = 0 - Number.parseInt(m[1]);
        this.oldest = Date.now().add(param);
      }
      this.datastore = (app.cfg('session/default_datastore') == 'database') ? 'database' : 'memory';
      //this.load();
    },
    load: function() {
      //load session data from data-store
      var session = getSessionObject(this), data;
      controllers[this.datastore].load(session);
      if (session.lastAccess && (!this.oldest || this.oldest < session.lastAccess)) {
        data = session.data;
      }
      if (data) {
        forEach(Object.keys(data), function(i, namespace) {
          data[namespace] = newCollection(session, data[namespace]);
        });
      } else {
        data = {};
      }
      return session.data = data;
    },
    getCollection: function() {
      var session = getSessionObject(this);
      var namespaces = session.data || this.load();
      return  namespaces[this.namespace] || (namespaces[this.namespace] = newCollection(session, {}));
    },
    reload: function() {
      //TODO: Only reload for this namespace
      var session = getSessionObject(this);
      if (session.data) {
        session.data = null;
        session.isDirty = false;
      }
      //this.load();
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
      if (session.data && session.isDirty) {
        controllers[this.datastore].save(session);
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
