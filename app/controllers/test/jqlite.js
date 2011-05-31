bind('ready', function() {

  var qunit = lib('qunit'), jq = lib('jqlite');

  //app('/test/jqlite', function() {
  //  var jq = lib('jqlite');
  //  var $ = jq.create('<p class=a>Hello <b>World');
  //  $('body p').addClass('b').append('<div id="three"/><div id="four"></div>');
  //  $('body').append('<p id=two>Another Paragraph</p>');
  //  $('title').text('Bits & Bobs');
  //  res.die($.toHTML());
  //});

  app('/test/jqlite', function() {

    var html = sys.fs.readTextFile('~/system/data/test/jqlite.html')
      , output = []
      , jQuery = jq.create(html)
      , $ = jQuery;

    module("core");
    test("Basic requirements", function() {
      expect(4);
      ok( Array.prototype.push, "Array.push()" );
      ok( Function.prototype.apply, "Function.apply()" );
      ok( RegExp, "RegExp" );
      ok( jQuery, "jQuery" );
    });

    var results = qunit.config.current;
    if (results && results.assertions) {
      forEach(results.assertions, function(i, assertion) {
        if (assertion.result) {
          output.push('Assertion ' + (i + 1) + ' passed.');
        } else {
          output.push('Assertion ' + (i + 1) + ' failed: ' + assertion.message);
        }
      });
    } else {
      output.push(qunit.config);
    }
    res.die(output.join('\n'));

  });

});
