bind('ready', function() {

  app('/admin/login', function() {
    var un = req.post('username') || req.params('username')
      , pw = req.post('password') || req.params('password')
      , result;
    if (!un && !pw) {
      un = this.session('user');
      result = (un) ? {success: true, user: un} : {success: false};
    } else
    if (un && un.toLowerCase() == 'admin' && pw == 'password') {
      this.session('user', 'admin');
      result = {success: true, user: un};
    } else {
      result = {success: false, error: 'Invalid Login Credentials'};
    }
    res.die('application/json', result);
  });

  app('/admin/logout', function() {
    this.session('user', null);
    res.die('application/json', {success: true});
  });

});
