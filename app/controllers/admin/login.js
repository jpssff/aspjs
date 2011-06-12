bind('ready', function() {

  var session = lib('session').init('shortterm namespace:auth');

  app('/admin/login', function() {
    var un = req.post('username') || req.params('username')
      , pw = req.post('password') || req.params('password')
      , result;
    if (String(un).toLowerCase() == 'admin' && String(pw) == 'password') {
      session('user', 'admin');
      result = {success: true, user: un};
    } else
    if ((un = session('user'))) {
      result = {success: true, user: un};
    } else {
      result = {success: false, error: 'Invalid Login Credentials'};
    }
    res.die('application/json', result);
  });

  app('/admin/check-auth', function() {
    var un = session('user'), result;
    if (un) {
      result = {logged_in: true, user: un}
    } else {
      result = {logged_in: false}
    }
    res.die('application/json', result);
  });

  app('/admin/logout', function() {
    session('user', null);
    res.die('application/json', {success: true});
  });

});
