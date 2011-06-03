bind('ready', function() {

  app('/test/dom', function() {
    var dom = lib('domwrapper');
    var doc = new dom.HtmlDoc('<!DOCTYPE html><html><body><p><' + '!--asdf--' + '>Hello <b>World</b></p></body></html>');
    var _doc = doc._xmlDoc;
    var frag = _doc.createDocumentFragment(), el = _doc.createElement('div');
    frag.appendChild(el);
    //el = frag.childNodes[0];
    res.die(el.parentNode === frag);

    res.die([doc.getElementsByTagName('body')[0].parentNode().parentNode()]);
    var doc = new dom.HtmlDoc('<p class=a>Hello <b>World');
    doc.getElementsByTagName('head')[0].appendHTML('<script>var a = (true && false) ? "" : "&amp;";<\/script>');
    doc.getElementsByTagName('body')[0].appendHTML('<p id=two name=item_two><span/>Another &amp; Paragraph<br/></p>');
    res.die(doc.outerHTML());
    var arr = doc.getElementsByTagName('p');
    res.die(arr.map(function(el){ return el.outerHTML(); }));
  });

});
