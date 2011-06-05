bind('ready', function() {

  var qunit = lib('qunit'), Session = lib('session'), JSON = lib('json');

  app('/test/session/run', function() {

    module("Pre-requisites");

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
      res.cookies('name', 'value')
      ok(res.cookies('name'), 'value', 'Check res.cookies can be modified');
      res.cookies('name', {val: 'value', exp: Date.today().add({months: 6})});
      var expected = '{"name":{"val":"value","exp":new Date(Date.UTC(2011,11,4,14,0,0,0))}}';
      ok(JSON.stringify(res.cookies()), expected, 'Check cookies collection serializes correctly');
    });


    module("Core");

    test("JSON", function() {
      expect(2);

      //Initializes session store with default options
      var session = Session.init();

      session('name', 'value'); // save to session variable
      //session('name', {name: 'value', items: [1, 2, '3']}); // save complex data type
      //session('name'); //= 'value'
      //session.save(); //flush changes to underlying datastore (app shared memory or database)
      //session('foo', 'bar');
      //session.load(); //reload from datastore
      //session('foo'); //= '' (empty string)

      equals(session('name'), 'value', 'Check primitive return value');
      equals(stringified, JSON.stringify(JSON.parse(stringified)), 'Check JSON.stringify(JSON.parse)');
    });

    res.die(qunit.getTestResults());

  });

});
