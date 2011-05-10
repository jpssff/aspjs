bind('ready', function() {
  
  /*
   * Testing Routes
   * These are for testing and framework development
   */

  app('/test/dom', function() {
    var dom = lib('domwrapper');
    var doc = new dom.HtmlDoc('<p class=a>Hello <b>World');
    doc.xpath('body').appendHTML('<p id=two name=item_two>Another Paragraph</p>');
    var el = doc.getElementsByName('item_two');
    res.die(el.length ? el[0].getPath() : el);
    res.die(arr.map(function(el){ return el.outerHTML(); }));
    res.die(doc.outerHTML());
  });

  app('/test/sizzle', function() {
    var dom = lib('domwrapper');
    var sizzle = lib('sizzle');
    var doc = new dom.HtmlDoc('<p class=a name=one>Hello <b>World');
    doc.xpath('body').appendHTML('<p name=two>Another Paragraph</p>');
    var arr = sizzle('body>p[name=two]', doc);
    res.die(arr.length ? arr[0].getPath() : arr);
  });

  app('/test/jqlite', function() {
    var jq = lib('jqlite');
    var $ = jq.create('<p class=a>Hello <b>World');
    $('body').append('<p id=two>Another Paragraph</p>');
    var results = $('body p').addClass('b');
    res.die($.serialize());
  });

  app('/test/wsc', function() {
    //var htmldom = GetObject('script:' + sys.mappath('system/wsc/htmldom.wsc'));
  });

  app('/test', function(p) {
    var out = [];
    var ActiveRecord = lib('activerecord');
    ActiveRecord.connect(ActiveRecord.Adapters.Access);
    var User = ActiveRecord.create('users', {
      username: '',
      password: '',
      post_count: 0,
      profile: ''
    }, {
      getProfileWordCount: function () {
        return this.get('profile').split(/\s+/).length;
      }
    });

    var jessica = User.create({
      username: "Jessica",
      password: "rabbit"
    });
    jessica.set('password', 'rabbit123');
    jessica.save();
    //jessica.destroy();

    res.die(jessica);
    //res.die([req.method(), req.url('path'), req.params()]);
  });

  app('/inheritance', function(p) {
    var out = [], Class = lib('class');
    res.die(out.join('\r\n'));
  });

  app('/test/class', function(p) {
    var out = [], Class = lib('class');
    var Person = Class.extend({
      init: function(isDancing){
        this.dancing = isDancing;
      },
      dance: function(){
        return this.dancing;
      }
    });
    var Ninja = Person.extend({
      init: function(){
        this._super( false );
      },
      dance: function(){
        return this._super();
      },
      swingSword: function(){
        return true;
      }
    });

    var p = new Person(true);
    out.push("true: " + p.dance());

    var n = new Ninja();
    out.push("false: " + n.dance());
    out.push("true: " + n.swingSword());

    out.push("true: " + (p instanceof Person));
    out.push("true: " + (p instanceof Class));
    out.push("true: " + (n instanceof Ninja));
    out.push("true: " + (n instanceof Person));
    out.push("true: " + (n instanceof Class));
    res.die(out.join('\r\n'));
  });

  app('/test/binary', function(p) {
    var b = new Binary('\uC548\uB155\uD558\uC138\uC694', 'utf16');
    res.die([b.toString('hex'), b.length()]);
  });

  app('/test/json', function() {
    var json = lib('json'), undef, fn = function(a){return true}, re = /abc/i;
    var a = {num: 1, str: 'strîng', arr: [1, 'two', true, '€', null, undef, fn], obj: {n: '2x9',
      val: 27}, dt: Date.fromString('29 Apr 2006'), re: re, fn: fn, bin: new Binary('«'),
      col: new Collection({a: 1, b: 'stür'}), undef: undef, nul: null, bool: false};
    var out = [json.stringify(a), json.stringify(a, true)];
    res.die(out.join('\r\n'), 'text/plain');
  });

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
    res.die(out.join('\r\n'),'text/html');
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

  app('/test/md5/:str', function(p) {
    var out = [];
    out.push(p('str'));
    out.push(new Binary(p('str')).md5().toString('hex'));
    res.die(out.join('\r\n'));
  });

  app('/test/tz/:dt', function(p) {
    var dt = Date.fromUTCString(p('dt'));
    if (dt) {
      dt = app.util.applyTimezone(dt);
      res.die(Date.format(dt,'{yyyy}/{mm}/{dd} {hh}:{nn}:{ss}'));
    } else {
      res.die('Invalid Date');
    }
  });
  
  //test database
  app('/test/db', function(p) {
    var docstore = lib('docstore')
      , store = docstore.getStore('main')
      , members = store.get('items');
    var m = {first:'Simon',last:'Sturmer'};
    m = members.save(m);
    m.last = 'Tester';
    members.save(m);
    res.die([m,m.__meta]);
  });
  
  //test docstore
  app('/test/docstore', function(p) {
    var docstore = lib('docstore')
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
  app('/test/email', function() {
    var net = lib('net');
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
  app('/test/error/:err?', function(p) {
    var err = p('err') || 'Unspecified Error';
    throw new Error(err);
  });
  
});
