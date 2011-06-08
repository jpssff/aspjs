bind('ready', function() {

  //var html = sys.fs.readTextFile('~/system/data/test/google.html');

  app('/test/http-req', function() {
    var net = lib('net'), dom = lib('domwrapper');
    var html = net.httpRequest('https://www.anz.com/inetbank/login.asp').toString();
    var doc = new dom.HtmlDoc(html);
    res.die(doc.getElementById('SignonButton').getAttribute('href'));
    var p1 = doc.getElementById('one'), div2 = doc.getElementById('second');
    div2.appendChild(p1);
    res.die(doc.xml());
  });

  app('/test/net', function() {
    var net = lib('net'), jq = lib('jqlite');
    var html = net.httpRequest('https://www.anz.com/inetbank/login.asp').toString();
    var $ = jq.create(html);
    $('script').remove();
    $('style').remove();
    var $frm = $('form[name=loginForm]');
    $frm.find('noscript>*').unwrap();
    $('a[href*=javascript]').attr('href', '#');
    $('a>img').each(function() {
      var text = $(this).attr('alt');
      $(this).replaceWith($('span').text(text));
    });
    $('[type=image]').attr({type: 'submit'});
    $('input[src]').removeAttr('src');
    $('#SignonButton').remove();
    $('*').removeAttr('autocomplete').removeAttr('onSubmit').removeAttr('onKeyPress').removeAttr('onFocus');

    res.die('text/html', $frm.toHTML());
  });

});
