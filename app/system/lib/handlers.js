/**
 * The following global event handlers run prior to anything
 * in app/code or app/controllers (unless another event is
 * attached with a : preceding its name).
 *
 */
bind('ready',function(){
  
  //Process pre-route redirects
  var redir = app.cfg('redir') || {}
    , path = req.url('path');
  if (Object.exists(redir,path)) {
    res.redirect(redir[path],'301');
  }
  
});

/**
 * Default 404 handler is meant to run after all routing
 * and after the no-route event.
 *
 */
bind('404',function(){
  //If response data is present from prior 404 handler, use that
  //Otherwise use default 404 response from config
  var data = this.response || app.cfg('res_404');
  res.clear(data.type);
  res.status('404');
  res.write(data.body);
  res.end();
});

