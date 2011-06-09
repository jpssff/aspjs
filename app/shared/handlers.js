/*!
 * The following adds handlers that are attached (and
 * executed) before controller code.
 *
 */
bind('ready', function() {

  //Process pre-route redirects
  var redir = app.cfg('redir') || {}, path = req.url('path');
  if (Object.exists(redir, path)) {
    res.redirect(redir[path], '301');
  }

  /*!
   * Load a previously saved "flash" message (specified by numeric key in query string or referrer)
   * retrieve it from QuickStore and save it to req.msg.
   *
   */
  var ref = req.headers('referrer'), m = req.url('qs').match(/^\?(\d+)$/);
  if (m) {
    if (ref) {
      res.redirect(req.url('path'), 'html');
    } else {
      req.msg = app.checkout(m[1]);
    }
  } else
  if (ref.indexOf('://' + req.headers('host') + '/') > 0) {
    m = ref.match(/\?(\d+)$/);
    if (m) {
      req.msg = app.checkout(m[1]);
    }
  }
  
  
});

/*!
 * The no-route event fires after all routes have been processed if none have called stop() or ended
 * the request.
 *
 */
bind('no-route', function() {

  //Attempt to render a "public" page.
  var matches = req.url('path').match(/^\/([^\/.]+)$/);
  if (matches) {
    try {
      this.render('public/' + matches[1]);
    } catch(e) {
      //View file may not exist for this URL
    }
  }

});

/**
 * This handler is executed *before* the default 404 handler (note the preceding colon) and it
 * modifies this.response which gets passed down the event chain to the last handler.
 *
 */
bind('!404',function(){

//  //Log Requested URL
//  if (!req.url('path').match(/\/(favicon\.ico|robots\.txt)$/)) {
//    sys.log(req.url() + ' ' + server.vars('ipaddr'), 'sys-not-found');
//  }
//
//  //HTML Redirect to friendly 404 page
//  var url = '/?not-found=' + urlEnc(req.url())
//    , templ = lib('templ')
//    , markup = app.cfg('html_redir');
//  if (templ && markup) {
//    //Pass rendered markup down the event chain
//    this.response = {
//      type: 'text/html',
//      body: templ.renderContent(markup,{redir:url})
//    };
//  }

});

