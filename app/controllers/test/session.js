bind('ready', function() {

  var qunit = lib('qunit'), Session = lib('session'), JSON = lib('json');

  app('/test/session/run', function() {

    //Initializes session store with default options (specified in config)
    //var session = Session.init('memory, autosave');
            //or  Session.init({memory: true, autosave: true});

//    session('name', 'value'); // save to session variable
//    session('name', {name: 'value', items: [1, 2, '3']}); // save complex data type
//    session('name'); //= 'value'
//    session.save(); //flush changes to underlying datastore (app shared memory or database)
//    session('foo', 'bar');
//    session.load(); //reload from datastore
//    session('foo'); //= '' (empty string)
    
    module("Basic Requirements");

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
      expect(2);
      ok(vartype(req.cookies, 'function'), 'Check req.cookies');
      ok(vartype(res.cookies, 'function'), 'Check res.cookies');
    });

//    test("Initialization", function() {
//      expect(4);
//      ok( Array.prototype.push, "Array.push()" );
//      ok( Function.prototype.apply, "Function.apply()" );
//      ok( RegExp, "RegExp" );
//      ok( jQuery, "jQuery" );
//    });

    res.die(qunit.getTestResults());

  });

});
