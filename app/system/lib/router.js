/*!
 * Request Router
 *
 * Request routing parses and handles the requested URL. A route matches a particular URL pattern to
 * a route handler function.
 *
 * The method this framework uses for describing URL patterns is similar to Sinatra. The
 * general form is /path/:param which allows named parameters.
 *
 */

if (!this.lib_router) this.lib_router = lib_router;
function lib_router() {
  
  var routes = [];
  
  /**
   * Parse the given route, returning a regular expression.
   *
   * An empty array should be passed as placeholder for
   * the key names.
   *
   * @param {String} path
   * @param {Array} keys
   * @returns {RegExp}
   */
  function parseRoute(route, fn) {
    var keys = [], str = route.concat('/?').replace(/\/\(/g, '(?:/');
    str = str.replace(/(\/)?(\.)?:([\w]+)(\?)?/g, function(_, slash, format, key, optional) {
      keys.push(key);
      slash = slash || '';
      return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + '([^/]+))' + (optional || '');
    });
    str = str.replace(/([\/.-])/g, '\\$1').replace(/\*/g, '(.+)');
    var rex = new RegExp('^' + str + '$', 'i');
    return [rex, function(matches) {
      var params = new Collection();
      Object.each(keys, function(i, str) {
        params(str, urlDec(matches[i]));
      });
      return fn.call(this, params);
    }];
  }

  var router = {
    data: {},
    addRoute: function(verb, a, b) {
      var type = vartype(a);
      verb = String.parse(verb).toUpperCase();
      if (type == 'string' && a.match(/[:*]/)) {
        routes.push([verb].concat(parseRoute(a, b)));
      } else
      if (type == 'string' || type == 'regexp') {
        routes.push([verb,a,b]);
      } else {
        throw new Error('Route Must be String or RegExp.');
      }
    },
    process: function() {
      var url = req.url('path')
        , verb = req.method()
        , data = this.data
        , stop = false;
      data.stop = function() {
        stop = true;
      };
      trigger('pre-route', data);
      routes.each(function(i, arr) {
        if (arr[0] && arr[0] != verb) {
          return true; //Continue
        }
        if (vartype(arr[1]) == 'regexp') {
          var matches = arr[1].exec(url);
          if (matches) {
            arr[2].call(data, matches.slice(1));
          }
        } else
        if (vartype(arr[1]) == 'string') {
          if (url == arr[1]) {
            arr[2].call(data);
          }
        }
        return !stop;
      });
      if (!stop) {
        trigger('no-route', data);
      }
      trigger('404', data);
      var response = data.response || app.cfg('res_404');
      res.clear(response.type, '404');
      res.write(response.body);
      res.end();
    }
  };
  
  /**
   * Setup route event (triggered from controller stub).
   *
   */
  bind('route', function() {
    router.process();
  });
  
  return router;
  
}
