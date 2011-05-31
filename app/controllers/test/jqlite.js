bind('ready', function() {

  var qunit = lib('qunit'), jq = lib('jqlite'), jQuery, $;

  function q() {
    var doc = jQuery._doc;
    return toArray(arguments).map(function(el) {
      return doc.getElementById(el)
    });
  }

  //app('/test/jqlite', function() {
  //  var jq = lib('jqlite');
  //  var $ = jq.create('<p class=a>Hello <b>World');
  //  $('body p').addClass('b').append('<div id="three"/><div id="four"></div>');
  //  $('body').append('<p id=two>Another Paragraph</p>');
  //  $('title').text('Bits & Bobs');
  //  res.die($.toHTML());
  //});

  app('/test/jqlite/run', function() {

    var html = sys.fs.readTextFile('~/system/data/test/jqlite.html');
    jQuery = $ = jq.create(html);
    var document = jQuery._doc, output = [];

    module("core");
    test("Basic requirements", function() {
      expect(4);
      ok( Array.prototype.push, "Array.push()" );
      ok( Function.prototype.apply, "Function.apply()" );
      ok( RegExp, "RegExp" );
      ok( jQuery, "jQuery" );
    });

    test("jQuery()", function() {
      expect(18);
      // Basic constructor's behavior
      equals( jQuery().length, 0, "jQuery() === jQuery([])" );
      equals( jQuery(undefined).length, 0, "jQuery(undefined) === jQuery([])" );
      equals( jQuery(null).length, 0, "jQuery(null) === jQuery([])" );
      equals( jQuery("").length, 0, "jQuery('') === jQuery([])" );
      var obj = jQuery("div")
      equals( jQuery(obj).selector, "div", "jQuery(jQueryObj) == jQueryObj" );
      var main = jQuery("#main");
      same( jQuery("div p", main).get(), q("sndp", "en", "sap"), "Basic selector with jQuery object as context" );
      var code = jQuery("<code/>");
      equals( code.length, 1, "Correct number of elements generated for code" );
      equals( code.parent().length, 0, "Make sure that the generated HTML has no parent." );
      var img = jQuery("<img/>");
      equals( img.length, 1, "Correct number of elements generated for img" );
      equals( img.parent().length, 0, "Make sure that the generated HTML has no parent." );
      var div = jQuery("<div/><hr/><code/><b/>");
      equals( div.length, 4, "Correct number of elements generated for div hr code b" );
      equals( div.parent().length, 0, "Make sure that the generated HTML has no parent." );
      equals( jQuery([1,2,3]).get(1), 2, "Test passing an array to the factory" );
      equals( jQuery(document.getElementsByTagName('body')[0]).get(0), jQuery('body').get(0), "Test passing an html node to the factory" );
      var elem = jQuery("<div/>", {
        text: "test",
        "class": "test2",
        id: "test3"
      });
      equals( elem[0].childNodes().length, 1, 'jQuery quick setter text');
      equals( elem[0].firstChild().nodeValue(), "test", 'jQuery quick setter text');
      equals( elem[0].getAttribute('class'), "test2", 'jQuery() quick setter class');
      equals( elem[0].getAttribute('id'), "test3", 'jQuery() quick setter id');
    });

    res.die(qunit.getTestResults());

  });

});
