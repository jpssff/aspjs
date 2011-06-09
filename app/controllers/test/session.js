bind('ready', function() {

  var qunit = lib('qunit'), Session = lib('session'), JSON = lib('json');

  app('/test/session/run', function() {

    testSuite("Pre-requisites");

    test("JSON", function() {
      expect(2);
      var obj = {str: '‹unïcøde›', num: 17, date: Date.fromString('2010/12/25'), 'null': null};
      obj.undef = obj.doesNotExist;
      obj.regexp = /^[a-z]$/i;
      obj.posInfinity = 1/0;
      obj.negInfinity = -1/0;
      obj.NaN = +'s';
      obj.list = [1, 'one', true, new Date(1970, 0, 1), obj.regexp, [1/0, false]];
      var expected = '{"str":"\\u2039un\\u00efc\\u00f8de\\u203a","num":17,"date":'
        + 'new Date(Date.UTC(2010,11,24,14,0,0,0)),"null":null,"undef":undefined,"regexp":'
        + 'new RegExp("^[a-z]$","i"),"posInfinity":Infinity,"negInfinity":-Infinity,"NaN":'
        + 'NaN,"list":[1,"one",true,new Date(Date.UTC(1969,11,31,14,0,0,0)),new RegExp("^[a-z]$","i"),'
        + '[Infinity,false]]}';
      var stringified = JSON.stringify(obj);
      equals(stringified, expected, 'Check JSON.stringify');
      equals(stringified, JSON.stringify(JSON.parse(stringified)), 'Check JSON.stringify(JSON.parse)');
    });

    test("Cookies", function() {
      expect(4);
      ok(vartype(req.cookies, 'function'), 'Check req.cookies exists');
      ok(vartype(res.cookies, 'function'), 'Check res.cookies exists');
      res.cookies('testCookie', 'testValue')
      ok(res.cookies('testCookie'), 'testValue', 'Check res.cookies can be modified');
      res.cookies('testCookie2', {value: 'testValue2', expiry: Date.fromUTCString('2029/10/31')});
      var expected = '{"testCookie2":{"value":"testValue2","expiry":new Date(Date.UTC(2029,9,31,0,0,0,0))}}';
      ok(JSON.stringify(res.cookies()), expected, 'Check cookies collection serializes correctly');
      //Remove Test Cookies
      res.cookies('testCookie', null);
      res.cookies('testCookie2', null);
    });


    testSuite("Core");

    test("Session Load", function() {
      expect(8);

      var session = Session.init('namespace:testing expiry:10m');

      var test = session('test');
      ok(vartype(test, 'undefined'), 'Check non-existant item');

      var token = session.getToken();
      ok(JSON.stringify(req.cookies()).indexOf(token) > 0 || JSON.stringify(res.cookies()).indexOf(token) > 0, 'Check for Session Token in Cookies');

      // save complex data type
      session('item1', {name: 'value', items: [1, 2, '3'], string: 'unicøde'});
      equals(JSON.stringify(session('item1')), '{"name":"value","items":[1,2,"3"],"string":"unic\\u00f8de"}', 'Check non-primitive was stored');

      session.reload();
      ok(vartype(session('item1'), 'undefined'), 'Check session was reloaded');

      session('item2', 'unicøde');
      equals(session('item2').length, 7, 'Check unicode string was stored correctly');

      session.flush();
      equals(session('item2'), 'unicøde', 'Check session item after flush');

      session.reload();
      equals(session('item2'), 'unicøde', 'Check session item after flush and reload');

      //var obj = {};
      //server.appvars.each(function(n, val) {
      //  obj[n] = val;
      //});
      //res.die(obj);

      session.clear();
      ok(vartype(session('item2'), 'undefined'), 'Check session was cleared');

    });

    res.die(qunit.getTestResults());

  });

});
