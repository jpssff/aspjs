/**
 * 404 event fires after all routing and after the no-route event.
 *
 */
bind('404', function() {

  //If response data is present from prior 404 handler, use that
  //Otherwise use default 404 response from config
  var data = this.response || app.cfg('res_404');
  res.clear(data.type);
  res.status('404');
  res.write(data.body);
  res.end();

});
