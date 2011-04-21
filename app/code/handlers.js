/**
 * The following adds handlers that are attached (and
 * executed) before controller code.
 *
 */
register('ready',function(){
  
  /**
   * Load a previously saved "flash" message.
   * Numeric key in URL query string or HTTP Referrer
   * references a message object in QuickStore which contains
   * a notification or error that should be displayed to the
   * user at page load.
   *
   */
  var referrer = req.headers('referrer')
    , matches = req.url('qs').match(/^\?(\d+)$/);
  if (matches) {
    if (referrer) {
      res.redirect(req.url('path'),'html');
    } else {
      req.msg = app.checkout(matches[1]);
    }
  } else
  if (referrer.indexOf('://' + req.headers('host') + '/') > 0) {
    matches = referrer.match(/\?(\d+)$/);
    if (matches) {
      req.msg = app.checkout(matches[1]);
    }
  }
  
  
});

/**
 * This event fires after all routes have been processed
 * if none have called stop() or ended the request.
 *
 */
register('no-route',function(){
  //Attempt to render a "public" page.
  var matches = req.url('path').match(/^\/([^\/.]+)$/);
  if (matches) {
    try {
      this.render('public/' + matches[1]);
    } catch(e) {
      //Page may not exist
    }
  }
});

/**
 * This handler is executed *before* the default 404
 * handler (specified by preceding colon) and it modifies
 * this.response which gets passed down the chain to the
 * default handler.
 *
 */
if (false)
register(':404',function(){
  //Log Requested URL
  if (!req.url('path').match(/\/(favicon\.ico|robots\.txt)$/)) {
    sys.log(req.url() + ' ' + server.vars('ipaddr'), 'sys-not-found');
  }
  //HTML Redirect to friendly 404 page
  var url = '/?not-found=' + urlEnc(req.url())
    , templ = require('templ')
    , markup = app.cfg('html_redir');
  if (templ && markup) {
    //Pass rendered markup down the event chain
    this.response = {
      type: 'text/html',
      body: templ.renderContent(markup,{redir:url})
    };
  }
});

