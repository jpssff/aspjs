bind('ready', function() {

  app('/test/suite', function() {
    var templ = lib('templ');
    var html = templ.render('test/test-suite');
    res.die(html, 'text/html');
  });

});
