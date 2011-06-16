bind('ready', function() {

  //date parsing
  app('/test/date/:date', function(p) {
    res.die(Date.fromString(p('date')));
  });

  //email sending
  app('/test/email', function() {
    var net = lib('net');
    net.sendEmail({
      to:        'simon.sturmer@gmail.com',
      from:      'sstur@me.com',
      subject:   'Test Message',
      body_text: 'Hello There! This is a test email.',
      body_html: '<h1>Hello</h1><p>This is a test.</p>'
    });
    var msg = 'Email Sent Successfully.';
    res.die(msg);
  });

  app('/test/json', function() {
    var json = lib('json'), undef, fn = function(a){return true}, re = /abc/i;
    var a = {num: 1, str: 'strîng', arr: [1, 'two', true, '€', null, undef, fn], obj: {n: '2x9',
      val: 27}, dt: Date.fromString('29 Apr 2006'), re: re, fn: fn, bin: new Binary('«'),
      col: new Collection({a: 1, b: 'stür'}), undef: undef, nul: null, bool: false};
    var out = [json.stringify(a), json.stringify(a, true)];
    res.die(out.join('\r\n'));
  });

  app('/test/inheritance', function(p) {
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

  //NOT IMPLEMENTED
  //app('/test/wsc', function() {
  //  var wsc_object = GetObject('script:' + sys.mappath('~/system/wsc/object.wsc'));
  //});

  app('/test/tz/:dt', function(p) {
    var dt = Date.fromUTCString(p('dt'));
    if (dt) {
      dt = app.util.applyTimezone(dt);
      res.die(Date.format(dt,'{yyyy}/{mm}/{dd} {hh}:{nn}:{ss}'));
    } else {
      res.die('Invalid Date');
    }
  });

});
