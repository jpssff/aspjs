bind('ready', function() {

  app('/test/dom', function() {
    var dom = lib('domwrapper');
    var doc = new dom.HtmlDoc('<!DOCTYPE html><html><body><p><' + '!--asdf--' + '>Hello <b>World</b></p></body></html>');
    res.die([doc.getElementsByTagName('p')[0].firstChild().nodeValue()]);
    var doc = new dom.HtmlDoc('<p class=a>Hello <b>World');
    doc.getElementsByTagName('head')[0].appendHTML('<script>var a = (true && false) ? "" : "&amp;";<\/script>');
    doc.getElementsByTagName('body')[0].appendHTML('<p id=two name=item_two><span/>Another &amp; Paragraph<br/></p>');
    res.die(doc.outerHTML());
    var arr = doc.getElementsByTagName('p');
    res.die(arr.map(function(el){ return el.outerHTML(); }));
  });

});
