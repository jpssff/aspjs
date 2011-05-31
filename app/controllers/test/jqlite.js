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
    document.body = document.getElementsByTagName('body')[0];

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
      equals( jQuery(document.body).get(0), jQuery('body').get(0), "Test passing an html node to the factory" );
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

    test("selector state", function() {
      expect(31);
      var test;
      test = jQuery(undefined);
      equals( test.selector, "", "Empty jQuery Selector" );
      equals( test.context, undefined, "Empty jQuery Context" );
      test = jQuery(document);
      equals( test.selector, "", "Document Selector" );
      equals( test.context, document, "Document Context" );
      test = jQuery(document.body);
      equals( test.selector, "", "Body Selector" );
      equals( test.context, document.body, "Body Context" );
      test = jQuery("#main");
      equals( test.selector, "#main", "#main Selector" );
      equals( test.context, document, "#main Context" );
      test = jQuery("#notfoundnono");
      equals( test.selector, "#notfoundnono", "#notfoundnono Selector" );
      equals( test.context, document, "#notfoundnono Context" );
      test = jQuery("#main", document);
      equals( test.selector, "#main", "#main Selector" );
      equals( test.context, document, "#main Context" );
      test = jQuery("#main", document.body);
      equals( test.selector, "#main", "#main Selector" );
      equals( test.context, document.body, "#main Context" );
      // Test cloning
      test = jQuery(test);
      equals( test.selector, "#main", "#main Selector" );
      equals( test.context, document.body, "#main Context" );
      test = jQuery(document.body).find("#main");
      equals( test.selector, "#main", "#main find Selector" );
      equals( test.context, document.body, "#main find Context" );
      test = jQuery("#main").filter("div");
      equals( test.selector, "#main.filter(div)", "#main filter Selector" );
      equals( test.context, document, "#main filter Context" );
      test = jQuery("#main").not("div");
      equals( test.selector, "#main.not(div)", "#main not Selector" );
      equals( test.context, document, "#main not Context" );
      test = jQuery("#main").filter("div").not("div");
      equals( test.selector, "#main.filter(div).not(div)", "#main filter, not Selector" );
      equals( test.context, document, "#main filter, not Context" );
      test = jQuery("#main").filter("div").not("div").end();
      equals( test.selector, "#main.filter(div)", "#main filter, not, end Selector" );
      equals( test.context, document, "#main filter, not, end Context" );
      test = jQuery("#main").parent("body");
      equals( test.selector, "#main.parent(body)", "#main parent Selector" );
      equals( test.context, document, "#main parent Context" );
      test = jQuery("#main").eq(0);
      equals( test.selector, "#main.slice(0,1)", "#main eq Selector" );
      equals( test.context, document, "#main eq Context" );
      var d = "<div />";
      equals(
        jQuery(d).appendTo(jQuery(d)).selector,
        jQuery(d).appendTo(d).selector,
        "manipulation methods make same selector for jQuery objects"
      );
    });

    test("trim", function() {
      expect(4);
      var nbsp = String.fromCharCode(160);
      equals( jQuery.trim("hello  "), "hello", "trailing space" );
      equals( jQuery.trim("  hello"), "hello", "leading space" );
      equals( jQuery.trim("  hello   "), "hello", "space on both sides" );
      equals( jQuery.trim("  " + nbsp + "hello  " + nbsp + " "), "hello", "&nbsp;" );
    });

    test("isPlainObject", function() {
      expect(9);
      // The use case that we want to match
      ok(jQuery.isPlainObject({}), "{}");
      // Not objects shouldn't be matched
      ok(!jQuery.isPlainObject(""), "string");
      ok(!jQuery.isPlainObject(0) && !jQuery.isPlainObject(1), "number");
      ok(!jQuery.isPlainObject(true) && !jQuery.isPlainObject(false), "boolean");
      ok(!jQuery.isPlainObject(null), "null");
      ok(!jQuery.isPlainObject(undefined), "undefined");
      // Arrays shouldn't be matched
      ok(!jQuery.isPlainObject([]), "array");
      // Instantiated objects shouldn't be matched
      ok(!jQuery.isPlainObject(new Date), "new Date");
      var fn = function(){};
      // Functions shouldn't be matched
      ok(!jQuery.isPlainObject(fn), "fn");
    });

    test("isFunction", function() {
      expect(13);
      // Make sure that false values return false
      ok( !jQuery.isFunction(), "No Value" );
      ok( !jQuery.isFunction( null ), "null Value" );
      ok( !jQuery.isFunction( undefined ), "undefined Value" );
      ok( !jQuery.isFunction( "" ), "Empty String Value" );
      ok( !jQuery.isFunction( 0 ), "0 Value" );
      // Check built-ins
      ok( jQuery.isFunction(String), "String Function("+String+")" );
      ok( jQuery.isFunction(Array), "Array Function("+Array+")" );
      ok( jQuery.isFunction(Object), "Object Function("+Object+")" );
      ok( jQuery.isFunction(Function), "Function Function("+Function+")" );
      // When stringified, this could be misinterpreted
      var mystr = "function";
      ok( !jQuery.isFunction(mystr), "Function String" );
      // When stringified, this could be misinterpreted
      var myarr = [ "function" ];
      ok( !jQuery.isFunction(myarr), "Function Array" );
      // When stringified, this could be misinterpreted
      var myfunction = { "function": "test" };
      ok( !jQuery.isFunction(myfunction), "Function Object" );
      // Make sure normal functions still work
      var fn = function(){};
      ok( jQuery.isFunction(fn), "Normal Function" );
    });

    test("jQuery('html')", function() {
      expect(13);
      jQuery.foo = false;
      var s = jQuery("<script>jQuery.foo='test';</script>")[0];
      ok( s, "Creating a script" );
      ok( !jQuery.foo, "Make sure the script wasn't executed prematurely" );
      // Test multi-line HTML
      var div = jQuery("<div>\r\nsome text\n<p>some p</p>\nmore text\r\n</div>")[0];
      equals( div.nodeName().toUpperCase(), "DIV", "Make sure we're getting a div." );
      equals( div.firstChild().nodeType(), 3, "Text node." );
      equals( div.lastChild().nodeType(), 3, "Text node." );
      equals( div.childNodes()[1].nodeType(), 1, "Paragraph." );
      equals( div.childNodes()[1].firstChild().nodeType(), 3, "Paragraph text." );
      ok( jQuery("<link rel='stylesheet'/>")[0], "Creating a link" );
      ok( !jQuery("<script/>")[0].parentNode(), "Create a script" );
      ok( jQuery("<input/>").attr("type", "hidden"), "Create an input and set the type." );
      var j = jQuery("<span>hi</span> there <" + "!-- mon ami --" + ">");
      ok( j.length >= 2, "Check node,textnode,comment creation" );
      ok( jQuery("<div></div>")[0], "Create a div with closing tag." );
      ok( jQuery("<table></table>")[0], "Create a table with closing tag." );
    });


    res.die(qunit.getTestResults());

  });

});
