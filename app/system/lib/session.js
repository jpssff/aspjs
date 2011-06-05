/*!
 * Session Library
 *
 * Uses cookie-based identification tokens to persist session state between HTTP requests.
 *
 */
if (!this.lib_session) this.lib_session = lib_session;
function lib_session() {

  var RE_TOKEN = /^[0-9a-f]{32}$/i;

  var cache = {};

  function getCookieName(type) {
    if (type == 'longterm') {
      return 'STSID';
    } else {
      return 'LTSID';
    }
  }

  function generateSessionToken() {
    return String.repeat('.', 32).replace(/./g, function() {
      return Number.random(0, 15).toString(16);
    });
  }

  function getSessionToken(type) {
    if (cache[type]) {
      return cache[type].token;
    }
    var key = getCookieName(type);
    var token = req.cookies(key);
    token = RE_TOKEN.test(token) ? token : null;
    if (!token || type == 'longterm') {
      token = token || generateSessionToken();
      if (type == 'longterm') {
        res.cookies(key, {val: token, exp: Date.today().add({months: 12})});
      } else {
        res.cookies(key, token);
      }
    }
    return cache[type] = {token: token};
  }

  var controllers = {
    memory: {
      'load': function(token) {
        var data = server.appvars('session:' + token);
        data = (vartype(data) != 'object') ? data : {};
        return new Collection(data);
      },
      'save': function(token, data) {
        server.appvars('session:' + token, data);
      }
    },
    database: {
      //TODO: database storage
    }
  };

  function Session(opts) {
    this.opts = opts;
    this.init();
  }

  Session.prototype = {
    init: function() {
      this.type = (this.opts.longterm) ? 'longterm' : 'shortterm';
      this.datastore = (app.cfg('session/datastore') == 'database') ? 'database' : 'memory';
      //this.load();
    },
    load: function() {
      //if this is the first instance of this type, bind the autosave function
      if (!cache[this.type]) {
        var self = this;
        bind('destroy', function() {
          self.flush();
        });
      }
      //if data has not been loaded from datastore
      if (!cache[this.type] || !cache[this.type].data) {
        var token = getSessionToken();
        cache[this.type].data = controllers[this.datastore].load(token);
      }
      return cache[this.type].data;
    },
    reload: function() {
      if (cache[this.type]) {
        cache[this.type].data = null;
      }
      //this.load();
    },
    access: function() {
      var collection = this.load();
      return collection.access.apply(collection, arguments);
    },
    flush: function() {
      var collection = this.load();
      if (collection.isDirty()) {
        var token = getSessionToken();
        controllers[this.datastore].save(token, collection);
      }
      collection.clearDirty();
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
          options[opt] = true;
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
      accessor.flush = session.flush.bind(session);
      return accessor;
    }
  };

}
