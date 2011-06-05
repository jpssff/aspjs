/*!
 * Session Library
 *
 * Uses cookie-based identification tokens to persist session state between HTTP requests.
 *
 */
if (!this.lib_session) this.lib_session = lib_session;
function lib_session() {

  function genSessionKey() {

  }

  function getSessionKey(type) {

  }

  var storage = {
    memory: {
      'load': function() {

      },
      'save': function(data) {

      }
    },
    database: {
      //TODO: persistent storage
    }
  };

  function Session(opts) {
    this.opts = opts;
    this.datastore = (opts.persistent || app.cfg('session/persistent')) ? 'database' : 'memory';
  }

  Session.prototype = {
    get: function() {

    },
    set: function() {

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
      return new Session(options);
    }
  };

}
