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

    session: lib('session').init('shortterm'),

    isXHR: function() {
      return (String(req.headers('x-requested-with')).toLowerCase() == 'xmlhttprequest');
    }

  });

});


/*!
 * Run before request routing
 *
 */
bind('pre-route', function() {

  //Some code to automatically check authentication for certain URL paths
  // might go here

});


/*!
 * The no-route event fires after all routes have been processed (assuming none have called
 * send404(), thrown an exception or ended the request) but before the 404 event.
 *
 */
bind('no-route', function() {

  //Sample code to redirect URL's that have no route and end in "/"
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
