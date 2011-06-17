/*
 * Context Helper Functions
 *
 * Attaches various helper functions to the router's context for quick access later. Items are later
 * accessible using "this" keyword inside routing event handlers.
 *
 */
bind('pre-route', function() {

  var self = this;

  Object.append(self, {

    session: lib('session').init('shortterm namespace:auth'),

    isXHR: function() {
      return (String(req.headers('x-requested-with')).toLowerCase() == 'xmlhttprequest');
    },

    error: function(message) {
      if (self.isXHR()) {
        res.die('application/json', {success: false, error: message});
      } else {
        res.die('Error: ' + message);
      }
    }

  });

});


/*!
 * App-specific Handlers (run before / after request routing)
 *
 */
bind('pre-route', function() {

  var url = req.url('path');
  if (url.startsWith('/admin/') && !url.match(/\/log(in|out)$/)) {
    if (!this.session('user')) {
      this.error('Unauthorized');
    }
  }

});


/*!
 * The no-route event fires after all routes have been processed (assuming none have called
 * stop(), thrown an error or ended the request) but before the 404 event.
 *
 */
bind('no-route', function() {

  var url = req.url('path');
  if (url.length > 1 && url.endsWith('/')) {
    res.redir(url.replaceTail('/', ''));
  }

});


/**
 * This handler is attached *before* the default 404 handler (note the preceding !) It
 * can modify this.response (which is used further down the event chain).
 *
 */
bind('!404',function() {

  if (this.isXHR()) {
    this.response = {type: 'application/json', body: {success: false, error: '404 Not Found'}};
  }

});


/*!
 * Helper Function Library
 *
 * Used throughout various models and controllers by calling lib('helpers')
 *
 */
if (!this.lib_helpers) this.lib_class = lib_helpers;
function lib_helpers() {
  return {

    normalizeNameToSlug: function(name) {
      var slug = String.parse(name).toLowerCase();
      slug = slug.replace(/[\W-]+/g, '-');
      slug = slug.replace(/^-+|-+$/g, '');
      return slug;
    },

    normalizeMarkupToText: function(markup) {
      var text = String.parse(markup).toLowerCase();
      //remove non-body tags including their contents
      text = text.replace(/<(script|style|title)[^>]*>([\s\S]*?)<\/\1[^>]*>/gim, '');
      //remove all other tags
      text = text.replace(/<[^>]*>/g, ' ');
      //&amp; -> &
      text = htmlDec(text);
      //it's -> its, pre-fix -> prefix
      text = text.replace(/(\w)['-](\w)/g, '$1$2');
      //a, b&c -> a b c
      text = text.replace(/[\W-]+/g, ' ');
      //trim leading/trailing space and done
      return text.trim();
    },

    indexText: function(text) {
      var lang = lib('lang');
      var arr = String.parse(text).split(/\W+/), words = {};
      for (var i = 0, len = arr.length; i < len; i++) {
        var word = lang.stemmer(arr[i]);
        words[word] = (words[word] || 0) + 1;
      }
      var results = [];
      for (var word in words) {
        results.push(word + '":' + words[word]);
      }
      return '{"' + results.sort().join(',"') + '}';
    }

  };
}
