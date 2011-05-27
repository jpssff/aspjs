bind('ready', function() {

  app('/test/dom', function() {
    var dom = lib('domwrapper');
    var doc = new dom.HtmlDoc('<p class=a>Hello <b>World');
    doc.getElementsByTagName('head')[0].appendHTML('<script>var a = (true && false) ? "" : "&amp;";<\/script>');
    doc.getElementsByTagName('body')[0].appendHTML('<p id=two name=item_two><span/>Another &amp; Paragraph<br/></p>');
    res.die(doc.outerHTML());
    var arr = doc.getElementsByTagName('p');
    res.die(arr.map(function(el){ return el.outerHTML(); }));
  });

  app('/test/jqlite', function() {
    var jq = lib('jqlite');
    var $ = jq.create('<p class=a>Hello <b>World');
    $('body').append('<p id=two>Another Paragraph</p>');
    var results = $('body p').addClass('b');//.add('<div id="three"/><div id="four"></div>');
    //res.die(results.parent().toHTML());
    //res.die(results.find('#two').size());
    res.die($.toHTML());
    res.die($('body').html());
  });

});
