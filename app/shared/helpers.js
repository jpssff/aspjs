/*
 * Helper Functions
 *
 * Attaches helper functions to the router's context for quick access later. Items are later
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
 * Other Handlers (run before or after request routing).
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
