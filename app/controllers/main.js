bind('ready', function() {
  
  app('/', function() {
    res.die('text/html', '<h1>Home</h1><p>Welcome to the home page.</p>');
  });

});

