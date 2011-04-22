register('ready',function() {
  
  /*
   * Testing Routes
   * These are for testing and framework development
   */

  app('/test',function(p){
    res.die([req.method(), req.url('path'), req.params()]);
  });

  app('/test/upload',function(){
    var templ = require('templ')
      , html = templ.render('test/upload');
    res.die(html,'text/html');
  });

  app('/test/upload/post',function(){
    var filestore = require('filestore'), json = require('json');
    //res.die(server.req.getPostData());
    var out = [], files = req.uploads();
    files.each(function(n, file){
      file = filestore.putFile(file);
      out.push('<p>' + htmlEnc(json.stringify(file)) + '</p>');
      out.push('<p><a href="/test/dl/' + file._id + '/' + urlEnc(file.name) + '">' +
        htmlEnc(file.name)  + '</a></p>');
    });
    res.die(out.join('\r\n'),'text/html');
  });
  
  app('/test/dl/:id/:name',function(p){
    var fs = require('filestore');
    var file = fs.getFile(p('id'));
    if (file) {
      file.send();
    } else {
      res.die('Not Found: ' + p('id'));
    }
  });

  app('/test/md5/:str',function(p){
    var out = [];
    out.push(p('str'));
    out.push(new Binary(p('str')).md5().toString('hex'));
    res.die(out.join('\r\n'));
  });

  app('/test/tz/:dt',function(p){
    var dt = Date.fromUTCString(p('dt'));
    if (dt) {
      dt = app.util.applyTimezone(dt);
      res.die(Date.format(dt,'{yyyy}/{mm}/{dd} {hh}:{nn}:{ss}'));
    } else {
      res.die('Invalid Date');
    }
  });
  
  //test database
  app('/test/db',function(p){
    var docstore = require('docstore')
      , store = docstore.getStore('main')
      , members = store.get('items');
    var m = {first:'Simon',last:'Sturmer'};
    m = members.save(m);
    m.last = 'Tester';
    members.save(m);
    res.die([m,m.__meta]);
  });
  
  //test docstore
  app('/test/docstore',function(p){
    var docstore = require('docstore')
      , store = docstore.getStore('main');
    
    var items = store.get('items');
    
    var person = items.find({name:'simon'})[0]
    if (!person) {
      person = items.save({name:'simon',dob:Date.fromString('1970/01/01'),age:28});
    }
    person.name = 'sturmer';
    items.save(person,true);
    res.die(items.find({name:'sturmer'}));
  });
  
  //test email sending
  app('/test/email',function(){
    var net = require('net');
    net.sendEmail({
      to:        'simon.sturmer@gmail.com',
      from:      'simon@blupinnacle.net',
      subject:   'Test Message',
      body_text: 'Hello: This is a test.',
      body_html: '<h1>Hello</h1><p>This is a test.</p>'
    });
    var msg = 'Email Sent Successfully.';
    res.redirect('/?' + app.checkin({msg_text: msg}));
  });
  
  //test error handling
  app('/test/error/:err?',function(p){
    var err = p('err') || 'Unspecified Error';
    throw new Error(err);
  });
  
});
