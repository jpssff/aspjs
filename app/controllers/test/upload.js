bind('ready', function() {

  app('/test/upload', function() {
    var templ = lib('templ');
    var html = templ.render('test/upload');
    res.die(html,'text/html');
  });

  app('/test/upload/post', function() {
    var json = lib('json'), filestore = lib('filestore');
    var out = [], uploads = req.uploads();
    uploads.each(function(n, upload) {
      out.push('<pre>' + htmlEnc(json.stringify(upload)) + '</pre>');
      var file = filestore.saveUpload(upload);
      out.push('<pre>' + htmlEnc(json.stringify(file)) + '</pre>');
      out.push('<p><a href="/test/dl/' + file.id + '/' + urlEnc(file.attr('name')) + '">' +
        htmlEnc(file.attr('name'))  + '</a></p>');
    });
    res.die('text/html', out.join('\r\n'));
  });

  app('/test/dl/:id/:name', function(p) {
    var filestore = lib('filestore');
    var file = filestore.getFile(p('id'));
    if (file) {
      file.send();
    } else {
      //Not Found: Request will fall through to default 404 action
    }
  });

});
