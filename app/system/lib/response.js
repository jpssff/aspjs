/**
 * HTTP Response
 *
 * This library abstracts the HTTP response interface exposing getter and setter methods for response status,
 * headers (cache-control, content-type, etc), charset and cookies.
 *
 * Requires: core, lib_globals, lib_server
 * Optional: lib_json, Binary
 *
 */

if (!this.lib_response) this.lib_response = lib_response;
function lib_response() {
  var res, server = lib('server');
  var _super = server.res;
  return res = Object.extend(_super, {
    clear: function(type, status) {
      _super.clear();
      if (type) {
        res.headers('content-type', type);
      }
      if (status) {
        res.status(status);
      }
    },
    write: function(data) {
      if (isPrimitive(data)) {
        _super.write(String(data));
      } else {
        var json = lib('json');
        _super.write((json) ? json.stringify(data) : String(data));
      }
    },
    end: function() {
      trigger('destroy');
      _super.end();
    },
    die: function() {
      var args = toArray(arguments), status = '200', ctype = 'text/plain';
      if (args.length > 1 && /^\d{3}$/.test(args[0])) {
        status = args.shift();
      }
      if (args.length > 1 && /^[\w-]+\/[\w-]+$/.test(args[0])) {
        ctype = args.shift();
      }
      res.clear(ctype, status);
      forEach(args, function(i, data) {
        if (global.Binary && data instanceof Binary) {
          res.writebin(data);
        } else {
          res.write(data);
        }
      });
      res.end();
    },
    redirect: function(url, type) {
      if (type == 'html') {
        html_redirect(url);
      }
      if (type == '301') {
        res.status('301 Moved Permanently');
      } else
      if (type == '303') {
        res.status('303 See Other');
      } else {
        res.status('302 Moved');
      }
      res.headers('Location', url);
      res.end();
    }
  });

  function html_redirect(url) {
    var templ = lib('templ')
      , markup = app.cfg('html_redir');
    if (templ && markup) {
      res.clear('text/html');
      res.write(templ.renderContent(markup, {redir: url}));
      res.end();
    }
  }
}
