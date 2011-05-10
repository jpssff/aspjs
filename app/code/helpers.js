/*
 * Helper Functions
 * These are attached to the router's data object to be used within handlers and controller functions.
 * Members of this object are accessible using "this" keyword inside routing handlers.
 * 
 */
bind('preroute', function() {

  var data = this, templ = lib('templ');
  
  //data passed to template (see render function)
  var templ_data = {
    http_host: req.headers('host'),
    http_referrer: req.headers('referrer')
  };
  if (req.msg) {
    templ_data.msg_text = req.msg.msg_text;
    templ_data.err_text = req.msg.err_text;
  }
  
  Object.append(data, {
    
    templ: templ,
    templ_data: templ_data,

    //Render template and send result, ending the request
    render: function(page,obj) {
      var html = templ.render(page, Object.append({}, templ_data, obj));
      res.die(html, 'text/html');
    }

  });

});
