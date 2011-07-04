bind('ready', function() {

  var jq = lib('jqlite')
    , net = lib('net')
    , templ = lib('templ');

  app('/example/jquery-demo', function() {

    var html = net.httpRequest('http://www.zdnet.com/').toString();
    var jQuery = jq.create(html), $ = jQuery;

    var listItems = $('.area-10 li'), articles = [];
    listItems.each(function() {
      articles.push({
        title: $('h3', this).text(),
        link: $('a', this).attr('href')
      });
    });

    var output = templ.render('sample/jquery-demo', {title: 'News Articles', articles: articles});

    res.die('text/html', output);
  });

});
