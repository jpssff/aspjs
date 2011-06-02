bind('ready', function() {

  var qunit = lib('qunit'), jq = lib('jqlite'), jQuery, $, html, document;

  function q() {
    var doc = jQuery._doc;
    return toArray(arguments).map(function(el) {
      return doc.getElementById(el)
    });
  }
  function t(a, b, c) {
    var f = jQuery(b).get();
    same(f, q.apply(q, c), a + " (" + b + ")");
  }
  function reset() {
    if (!html) html = sys.fs.readTextFile('~/system/data/test/jqlite.html');
    jQuery = $ = jq.create(html);
    document = jQuery._doc;
    document.body = document.getElementsByTagName('body')[0];
  }

  app('/test/sizzle', function() {
    var dom = lib('domwrapper'), sizzle = lib('sizzle');
    var html = '<p id="ap">Here are some links in a normal paragraph: <a id="google" href="http://www.google.com/" title="Google!">Google</a>,' +
    '<a id="groups" href="http://groups.google.com/" class="GROUPS">Google Groups (Link)</a>. ' +
    'This link has <code><a href="http://smin" id="anchor1">class="blog"</a></code>: ' +
    '<a href="http://diveintomark.org/" class="blog" hreflang="en" id="mark">diveintomark</a></p>';
    var doc = new dom.HtmlDoc(html), body = doc.getElementsByTagName('body')[0];
    var $ = jq.create(html);
    res.die($('#ap > a').length);
    //body.appendHTML('<p id=two>Another Paragraph</p>');
    //var arr = doc.getElementsByTagName('p');
    var arr = sizzle('p > a', body);
    res.die(arr.map(function(el){ return el.outerHTML(); }).join('\r\n'));
  });

  app('/test/jqlite/run', function() {

    reset();

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

    test("jQuery('html', context)", function() {
      expect(1);
      var $div = jQuery("<div/>")[0];
      var $span = jQuery("<span/>", $div);
      equals($span.length, 1, "Verify a span created with a div context works, #1763");
    });

    test("end()", function() {
      expect(3);
      equals( 'Yahoo', jQuery('#yahoo').parent().end().text(), 'Check for end' );
      ok( jQuery('#yahoo').end(), 'Check for end with nothing to end' );
      var x = jQuery('#yahoo');
      x.parent();
      equals( 'Yahoo', jQuery('#yahoo').text(), 'Check for non-destructive behaviour' );
    });

    test("wrapped set functions", function() {
      expect(28);
      equals( jQuery("p").length, 6, "$(el).length" );
      equals( jQuery("p").size(), 6, "$(el).size()" );
      same( jQuery("p").get(), q("firstp","ap","sndp","en","sap","first"), "Get All Elements" );
      same( jQuery("p").toArray(), q("firstp","ap","sndp","en","sap","first"), "Convert jQuery object to an Array" );
      equals( jQuery("p").get(0), document.getElementById("firstp"), "Get A Single Element" );
      equals( jQuery("p").get(-1), document.getElementById("first"), "Get a single element with negative index" )
      var div = jQuery("div");
      div.each(function(){this.foo = 'zoo';});
      var pass = true;
      for ( var i = 0; i < div.size(); i++ ) {
        if ( div.get(i).foo != "zoo" ) pass = false;
      }
      ok( pass, "Execute a function, Relative" );
      var $links = jQuery("#ap a");
      same( $links.slice(1,2).get(), q("groups"), "slice(1,2)" );
      same( $links.slice(1).get(), q("groups", "anchor1", "mark"), "slice(1)" );
      same( $links.slice(0,3).get(), q("google", "groups", "anchor1"), "slice(0,3)" );
      same( $links.slice(-1).get(), q("mark"), "slice(-1)" );
      same( $links.eq(1).get(), q("groups"), "eq(1)" );
      same( $links.eq('2').get(), q("anchor1"), "eq('2')" );
      same( $links.eq(-1).get(), q("mark"), "eq(-1)" );
      var $links = jQuery("#ap a"), $none = jQuery("asdf");
      same( $links.first().get(), q("google"), "first()" );
      same( $links.last().get(), q("mark"), "last()" );
      same( $none.first().get(), [], "first() none" );
      same( $none.last().get(), [], "last() none" );
      same(
        jQuery("#ap").map(function(){
          return jQuery(this).find("a").get();
        }).get(),
        q("google", "groups", "anchor1", "mark"), "Array Map");
      same(
        jQuery("#ap > a").map(function(){
          return this.parentNode();
        }).get(),
        q("ap", "ap", "ap"), "Single Map");
      var parse = jQuery.merge;
      same( parse([],[]), [], "Empty arrays" );
      same( parse([1],[2]), [1,2], "Basic" );
      same( parse([1,2],[3,4]), [1,2,3,4], "Basic" );
      same( parse([1,2],[]), [1,2], "Second empty" );
      same( parse([],[1,2]), [1,2], "First empty" );
      same( parse([-2,-1], [0,1,2]), [-2,-1,0,1,2], "Second array including a zero (falsy)");
      same( parse([], [null, undefined]), [null, undefined], "Second array including null and undefined values");
      same( parse({length:0}, [1,2]), {length:2, 0:1, 1:2}, "First array like");
    });

    test("jQuery.extend(Object, Object)", function() {
      expect(25);
      var settings = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
        options = { xnumber2: 1, xstring2: "x", xxx: "newstring" },
        optionsCopy = { xnumber2: 1, xstring2: "x", xxx: "newstring" },
        merged = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "x", xxx: "newstring" },
        deep1 = { foo: { bar: true } },
        deep1copy = { foo: { bar: true } },
        deep2 = { foo: { baz: true }, foo2: document },
        deep2copy = { foo: { baz: true }, foo2: document },
        deepmerged = { foo: { bar: true, baz: true }, foo2: document },
        arr = [1, 2, 3],
        nestedarray = { arr: arr };
      jQuery.extend(settings, options);
      same( settings, merged, "Check if extended: settings must be extended" );
      same( options, optionsCopy, "Check if not modified: options must not be modified" );
      jQuery.extend(settings, null, options);
      same( settings, merged, "Check if extended: settings must be extended" );
      same( options, optionsCopy, "Check if not modified: options must not be modified" );
      jQuery.extend(true, deep1, deep2);
      same( deep1.foo, deepmerged.foo, "Check if foo: settings must be extended" );
      same( deep2.foo, deep2copy.foo, "Check if not deep2: options must not be modified" );
      equals( deep1.foo2, document, "Make sure that a deep clone was not attempted on the document" );
      ok( jQuery.extend(true, [], arr) !== arr, "Deep extend of array must clone array" );
      ok( jQuery.extend(true, {}, nestedarray).arr !== arr, "Deep extend of object must clone child array" );
      var empty = {};
      var optionsWithLength = { foo: { length: -1 } };
      jQuery.extend(true, empty, optionsWithLength);
      same( empty.foo, optionsWithLength.foo, "The length property must copy correctly" );
      empty = {};
      var optionsWithDate = { foo: { date: new Date } };
      jQuery.extend(true, empty, optionsWithDate);
      same( empty.foo, optionsWithDate.foo, "Dates copy correctly" );
      //var myKlass = function() {};
      //var customObject = new myKlass();
      //var optionsWithCustomObject = { foo: { date: customObject } };
      //empty = {};
      //jQuery.extend(true, empty, optionsWithCustomObject);
      //ok( empty.foo && empty.foo.date === customObject, "Custom objects copy correctly (no methods)" );
      //// Makes the class a little more realistic
      //myKlass.prototype = { someMethod: function(){} };
      //empty = {};
      //jQuery.extend(true, empty, optionsWithCustomObject);
      //ok( empty.foo && empty.foo.date === customObject, "Custom objects copy correctly" );
      var ret = jQuery.extend(true, { foo: 4 }, { foo: new Number(5) } );
      ok( ret.foo == 5, "Wrapped numbers copy correctly" );
      var nullUndef;
      nullUndef = jQuery.extend({}, options, { xnumber2: null });
      ok( nullUndef.xnumber2 === null, "Check to make sure null values are copied");
      nullUndef = jQuery.extend({}, options, { xnumber2: undefined });
      ok( nullUndef.xnumber2 === options.xnumber2, "Check to make sure undefined values are not copied");
      nullUndef = jQuery.extend({}, options, { xnumber0: null });
      ok( nullUndef.xnumber0 === null, "Check to make sure null values are inserted");
      var target = {};
      var recursive = { foo:target, bar:5 };
      jQuery.extend(true, target, recursive);
      same( target, { bar:5 }, "Check to make sure a recursive obj doesn't go never-ending loop by not copying it over" );
      var ret = jQuery.extend(true, { foo: [] }, { foo: [0] } ); // 1907
      equals( ret.foo.length, 1, "Check to make sure a value with coersion 'false' copies over when necessary to fix #1907" );
      var ret = jQuery.extend(true, { foo: "1,2,3" }, { foo: [1, 2, 3] } );
      ok( typeof ret.foo != "string", "Check to make sure values equal with coersion (but not actually equal) overwrite correctly" );
      var ret = jQuery.extend(true, { foo:"bar" }, { foo:null } );
      ok( typeof ret.foo !== 'undefined', "Make sure a null value doesn't crash with deep extend, for #1908" );
      var obj = { foo:null };
      jQuery.extend(true, obj, { foo:"notnull" } );
      equals( obj.foo, "notnull", "Make sure a null value can be overwritten" );
      function func() {}
      jQuery.extend(func, { key: "value" } );
      equals( func.key, "value", "Verify a function can be extended" );
      var defaults = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
        defaultsCopy = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
        options1 = { xnumber2: 1, xstring2: "x" },
        options1Copy = { xnumber2: 1, xstring2: "x" },
        options2 = { xstring2: "xx", xxx: "newstringx" },
        options2Copy = { xstring2: "xx", xxx: "newstringx" },
        merged2 = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "xx", xxx: "newstringx" };
      var settings = jQuery.extend({}, defaults, options1, options2);
      same( settings, merged2, "Check if extended: settings must be extended" );
      same( defaults, defaultsCopy, "Check if not modified: options1 must not be modified" );
      same( options1, options1Copy, "Check if not modified: options1 must not be modified" );
      same( options2, options2Copy, "Check if not modified: options2 must not be modified" );
    });

    test("jQuery.each(Object,Function)", function() {
      expect(13);
      jQuery.each( [0,1,2], function(i, n){
        equals( i, n, "Check array iteration" );
      });
      jQuery.each( [5,6,7], function(i, n){
        equals( i, n - 5, "Check array iteration" );
      });
      jQuery.each( { name: "name", lang: "lang" }, function(i, n){
        equals( i, n, "Check object iteration" );
      });
      var total = 0;
      jQuery.each([1,2,3], function(i,v){ total += v; });
      equals( total, 6, "Looping over an array" );
      total = 0;
      jQuery.each([1,2,3], function(i,v){ total += v; if ( i == 1 ) return false; });
      equals( total, 3, "Looping over an array, with break" );
      total = 0;
      jQuery.each({"a":1,"b":2,"c":3}, function(i,v){ total += v; });
      equals( total, 6, "Looping over an object" );
      total = 0;
      jQuery.each({"a":3,"b":3,"c":3}, function(i,v){ total += v; return false; });
      equals( total, 3, "Looping over an object, with break" );
      var f = function(){};
      f.foo = 'bar';
      jQuery.each(f, function(i){
        f[i] = 'baz';
      });
      equals( "baz", f.foo, "Loop over a function" );
    });

    test("jQuery.makeArray", function(){
      expect(15);
      equals( jQuery.makeArray(jQuery('html>*'))[0].nodeName().toUpperCase(), "HEAD", "Pass makeArray a jQuery object" );
      equals( jQuery.makeArray(document.getElementsByName("PWD")).slice(0,1)[0].getAttribute('name'), "PWD", "Pass makeArray a nodelist" );
      equals( (function(){ return jQuery.makeArray(arguments); })(1,2).join(""), "12", "Pass makeArray an arguments array" );
      equals( jQuery.makeArray([1,2,3]).join(""), "123", "Pass makeArray a real array" );
      equals( jQuery.makeArray().length, 0, "Pass nothing to makeArray and expect an empty array" );
      equals( jQuery.makeArray( 0 )[0], 0 , "Pass makeArray a number" );
      equals( jQuery.makeArray( "foo" )[0], "foo", "Pass makeArray a string" );
      equals( jQuery.makeArray( true )[0].constructor, Boolean, "Pass makeArray a boolean" );
      equals( jQuery.makeArray( document.createElement("div") )[0].nodeName().toUpperCase(), "DIV", "Pass makeArray a single node" );
      equals( jQuery.makeArray( {length:2, 0:"a", 1:"b"} ).join(""), "ab", "Pass makeArray an array like map (with length)" );
      ok( !!jQuery.makeArray( document.documentElement().childNodes() ).slice(0,1)[0].nodeName(), "Pass makeArray a childNodes array" );
      // function, is tricky as it has length
      equals( jQuery.makeArray( function(){ return 1;} )[0](), 1, "Pass makeArray a function" );
      equals( jQuery.makeArray(/a/)[0].constructor, RegExp, "Pass makeArray a regex" );
      //ok( jQuery.makeArray(document.getElementById('form')).length >= 13, "Pass makeArray a form (treat as elements)" );
      same( jQuery.makeArray({'length': '0'}), [], "Make sure object is coerced properly.");
      same( jQuery.makeArray({'length': '5'}), [], "Make sure object is coerced properly.");
    });

    test("jQuery.isEmptyObject", function(){
      expect(2);
      equals(true, jQuery.isEmptyObject({}), "isEmptyObject on empty object literal" );
      equals(false, jQuery.isEmptyObject({a:1}), "isEmptyObject on non-empty object literal" );
    });


    module("selector");

    test("element", function() {
      expect(18);
      ok( jQuery("*").size() >= 30, "Select all" );
      var all = jQuery("*"), good = true;
      for ( var i = 0; i < all.length; i++ )
        if ( all[i].nodeType() == 8 )
          good = false;
      ok( good, "Select all elements, no comment nodes" );
      t( "Element Selector", "p", ["firstp","ap","sndp","en","sap","first"] );
      t( "Element Selector", "body", ["body"] );
      //t( "Element Selector", "html", ["html"] );
      t( "Parent Element", "div p", ["firstp","ap","sndp","en","sap","first"] );
      equals( jQuery("param", "#object1").length, 2, "Object/param as context" );
      same( jQuery("p", document.getElementsByTagName("div")).get(), q("firstp","ap","sndp","en","sap","first"), "Finding elements with a context." );
      same( jQuery("p", "div").get(), q("firstp","ap","sndp","en","sap","first"), "Finding elements with a context." );
      same( jQuery("p", jQuery("div")).get(), q("firstp","ap","sndp","en","sap","first"), "Finding elements with a context." );
      same( jQuery("div").find("p").get(), q("firstp","ap","sndp","en","sap","first"), "Finding elements with a context." );
      same( jQuery("#form").find("select").get(), q("select1","select2","select3"), "Finding selects with a context." );
      ok( jQuery("#length").length, '&lt;input name="length"&gt; cannot be found under IE, see #945' );
      ok( jQuery("#lengthtest input").length, '&lt;input name="length"&gt; cannot be found under IE, see #945' );
      // Check for unique-ness and sort order
      same( jQuery("*").get(), jQuery("*, *").get(), "Check for duplicates: *, *" );
      same( jQuery("p").get(), jQuery("p, div p").get(), "Check for duplicates: p, div p" );
      t( "Checking sort order", "h2, h1", ["qunit-header", "qunit-banner", "qunit-userAgent"] );
      t( "Checking sort order", "h2:first, h1:first", ["qunit-header", "qunit-banner"] );
      t( "Checking sort order", "p, p a", ["firstp", "simon1", "ap", "google", "groups", "anchor1", "mark", "sndp", "en", "yahoo", "sap", "anchor2", "simon", "first"] );
    });

    test("broken", function() {
      expect(8);
      function broken(name, selector) {
        try {
          jQuery(selector);
          ok( false, name + ": " + selector );
        } catch(e){
          ok(  typeof e === "string" && e.indexOf("Syntax error") >= 0, name + ": " + selector );
        }
      }
      broken( "Broken Selector", "[", [] );
      broken( "Broken Selector", "(", [] );
      broken( "Broken Selector", "{", [] );
      broken( "Broken Selector", "<", [] );
      broken( "Broken Selector", "()", [] );
      broken( "Broken Selector", "<>", [] );
      broken( "Broken Selector", "{}", [] );
      broken( "Doesn't exist", ":visble", [] );
    });

    test("id", function() {
      expect(28);
      t( "ID Selector", "#body", ["body"] );
      t( "ID Selector w/ Element", "body#body", ["body"] );
      t( "ID Selector w/ Element", "ul#first", [] );
      t( "ID selector with existing ID descendant", "#firstp #simon1", ["simon1"] );
      t( "ID selector with non-existant descendant", "#firstp #foobar", [] );
      t( "ID selector using UTF8", "#台北Táiběi", ["台北Táiběi"] );
      t( "Multiple ID selectors using UTF8", "#台北Táiběi, #台北", ["台北Táiběi","台北"] );
      t( "Descendant ID selector using UTF8", "div #台北", ["台北"] );
      t( "Child ID selector using UTF8", "form > #台北", ["台北"] );
      t( "Escaped ID", "#foo\\:bar", ["foo:bar"] );
      t( "Escaped ID", "#test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
      t( "Descendant escaped ID", "div #foo\\:bar", ["foo:bar"] );
      t( "Descendant escaped ID", "div #test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
      t( "Child escaped ID", "form > #foo\\:bar", ["foo:bar"] );
      t( "Child escaped ID", "form > #test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
      t( "ID Selector, child ID present", "#form > #radio1", ["radio1"] ); // bug #267
      t( "ID Selector, not an ancestor ID", "#form #first", [] );
      t( "ID Selector, not a child ID", "#form > #option1a", [] );
      t( "All Children of ID", "#foo > *", ["sndp", "en", "sap"] );
      t( "All Children of ID with no children", "#firstUL > *", [] );
      var a = jQuery('<div><a name="tName1">tName1 A</a><a name="tName2">tName2 A</a><div id="tName1">tName1 Div</div></div>').appendTo('#main');
      equals( jQuery("#tName1")[0].getAttribute('id'), 'tName1', "ID selector with same value for a name attribute" );
      equals( jQuery("#tName2").length, 0, "ID selector non-existing but name attribute on an A tag" );
      a.remove();
      t( "ID Selector on Form with an input that has a name of 'id'", "#lengthtest", ["lengthtest"] );
      t( "ID selector with non-existant ancestor", "#asdfasdf #foobar", [] ); // bug #986
      same( jQuery("body").find("div#form").get(), [], "ID selector within the context of another element" );
      t( "Underscore ID", "#types_all", ["types_all"] );
      t( "Dash ID", "#fx-queue", ["fx-queue"] );
      t( "ID with weird characters in it", "#name\\+value", ["name+value"] );
    });

    test("class", function() {
      expect(22);
      t( "Class Selector", ".blog", ["mark","simon"] );
      t( "Class Selector", ".GROUPS", ["groups"] );
      t( "Class Selector", ".blog.link", ["simon"] );
      t( "Class Selector w/ Element", "a.blog", ["mark","simon"] );
      t( "Parent Class Selector", "p .blog", ["mark","simon"] );
      same( jQuery(".blog", document.getElementsByTagName("p")).get(), q("mark", "simon"), "Finding elements with a context." );
      same( jQuery(".blog", "p").get(), q("mark", "simon"), "Finding elements with a context." );
      same( jQuery(".blog", jQuery("p")).get(), q("mark", "simon"), "Finding elements with a context." );
      same( jQuery("p").find(".blog").get(), q("mark", "simon"), "Finding elements with a context." );
      t( "Class selector using UTF8", ".台北Táiběi", ["utf8class1"] );
      t( "Class selector using UTF8", ".台北Táiběi.台北", ["utf8class1"] );
      t( "Class selector using UTF8", ".台北Táiběi, .台北", ["utf8class1","utf8class2"] );
      t( "Descendant class selector using UTF8", "div .台北Táiběi", ["utf8class1"] );
      t( "Child class selector using UTF8", "form > .台北Táiběi", ["utf8class1"] );
      t( "Escaped Class", ".foo\\:bar", ["foo:bar"] );
      t( "Escaped Class", ".test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
      t( "Descendant scaped Class", "div .foo\\:bar", ["foo:bar"] );
      t( "Descendant scaped Class", "div .test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
      t( "Child escaped Class", "form > .foo\\:bar", ["foo:bar"] );
      t( "Child escaped Class", "form > .test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
      var div = document.createElement("div");
      div.innerHTML("<div class='test e'></div><div class='test'></div>");
      same( jQuery(".e", div).get(), [ div.firstChild() ], "Finding a second class." );
      div.lastChild().setAttribute('class', "e");
      same( jQuery(".e", div).get(), [ div.firstChild(), div.lastChild() ], "Finding a modified class." );
    });

    test("name", function() {
      expect(14);
      t( "Name selector", "input[name=action]", ["text1"] );
      t( "Name selector with single quotes", "input[name='action']", ["text1"] );
      t( "Name selector with double quotes", 'input[name="action"]', ["text1"] );
      t( "Name selector non-input", "[name=test]", ["length", "fx-queue"] );
      t( "Name selector non-input", "[name=div]", ["fadein"] );
      t( "Name selector non-input", "*[name=iframe]", ["iframe"] );
      t( "Name selector for grouped input", "input[name='types[]']", ["types_all", "types_anime", "types_movie"] )
      same( jQuery("#form").find("input[name=action]").get(), q("text1"), "Name selector within the context of another element" );
      same( jQuery("#form").find("input[name='foo[bar]']").get(), q("hidden2"), "Name selector for grouped form element within the context of another element" );
      var a = jQuery('<div><a id="tName1ID" name="tName1">tName1 A</a><a id="tName2ID" name="tName2">tName2 A</a><div id="tName1">tName1 Div</div></div>').appendTo('#main').children();
      equals( a.length, 3, "Make sure the right number of elements were inserted." );
      equals( a[1].getAttribute('id'), "tName2ID", "Make sure the right number of elements were inserted." );
      t( "Find elements that have similar IDs", "[name=tName1]", ["tName1ID"] );
      t( "Find elements that have similar IDs", "[name=tName2]", ["tName2ID"] );
      t( "Find elements that have similar IDs", "#tName2ID", ["tName2ID"] );
      a.remove();
    });

    test("multiple", function() {
      expect(4);
      t( "Comma Support", "h2, p", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
      t( "Comma Support", "h2 , p", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
      t( "Comma Support", "h2 , p", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
      t( "Comma Support", "h2,p", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
    });

    test("child and adjacent", function() {
      reset();
      expect(27);
      t( "Child", "p > a", ["simon1","google","groups","mark","yahoo","simon"] );
      t( "Child", "p> a", ["simon1","google","groups","mark","yahoo","simon"] );
      t( "Child", "p >a", ["simon1","google","groups","mark","yahoo","simon"] );
      t( "Child", "p>a", ["simon1","google","groups","mark","yahoo","simon"] );
      t( "Child w/ Class", "p > a.blog", ["mark","simon"] );
      t( "All Children", "code > *", ["anchor1","anchor2"] );
      t( "All Grandchildren", "p > * > *", ["anchor1","anchor2"] );
      t( "Adjacent", "a + a", ["groups"] );
      t( "Adjacent", "a +a", ["groups"] );
      t( "Adjacent", "a+ a", ["groups"] );
      t( "Adjacent", "a+a", ["groups"] );
      t( "Adjacent", "p + p", ["ap","en","sap"] );
      t( "Adjacent", "p#firstp + p", ["ap"] );
      t( "Adjacent", "p[lang=en] + p", ["sap"] );
      t( "Adjacent", "a.GROUPS + code + a", ["mark"] );
      t( "Comma, Child, and Adjacent", "a + a, code > a", ["groups","anchor1","anchor2"] );
      t( "Element Preceded By", "p ~ div", ["foo", "moretests","tabindex-tests", "liveHandlerOrder", "siblingTest"] );
      t( "Element Preceded By", "#first ~ div", ["moretests","tabindex-tests", "liveHandlerOrder", "siblingTest"] );
      t( "Element Preceded By", "#groups ~ a", ["mark"] );
      t( "Element Preceded By", "#length ~ input", ["idTest"] );
      t( "Element Preceded By", "#siblingfirst ~ em", ["siblingnext"] );
      t( "Verify deep class selector", "div.blah > p > a", [] );
      t( "No element deep selector", "div.foo > span > a", [] );
      same( jQuery("> :first", document.getElementById("nothiddendiv")).get(), q("nothiddendivchild"), "Verify child context positional selector" );
      same( jQuery("> :eq(0)", document.getElementById("nothiddendiv")).get(), q("nothiddendivchild"), "Verify child context positional selector" );
      same( jQuery("> *:first", document.getElementById("nothiddendiv")).get(), q("nothiddendivchild"), "Verify child context positional selector" );
      t( "Non-existant ancestors", ".fototab > .thumbnails > a", [] );
    });

    test("attributes", function() {
      expect(34);
      t( "Attribute Exists", "a[title]", ["google"] );
      t( "Attribute Exists", "*[title]", ["google"] );
      t( "Attribute Exists", "[title]", ["google"] );
      t( "Attribute Exists", "a[ title ]", ["google"] );
      t( "Attribute Equals", "a[rel='bookmark']", ["simon1"] );
      t( "Attribute Equals", 'a[rel="bookmark"]', ["simon1"] );
      t( "Attribute Equals", "a[rel=bookmark]", ["simon1"] );
      t( "Attribute Equals", "a[href='http://www.google.com/']", ["google"] );
      t( "Attribute Equals", "a[ rel = 'bookmark' ]", ["simon1"] );
      document.getElementById("anchor2").href = "#2";
      t( "href Attribute", "p a[href^=#]", ["anchor2"] );
      t( "href Attribute", "p a[href*=#]", ["simon1", "anchor2"] );
      t( "for Attribute", "form label[for]", ["label-for"] );
      t( "for Attribute in form", "#form [for=action]", ["label-for"] );
      t( "Attribute containing []", "input[name^='foo[']", ["hidden2"] );
      t( "Attribute containing []", "input[name^='foo[bar]']", ["hidden2"] );
      t( "Attribute containing []", "input[name*='[bar]']", ["hidden2"] );
      t( "Attribute containing []", "input[name$='bar]']", ["hidden2"] );
      t( "Attribute containing []", "input[name$='[bar]']", ["hidden2"] );
      t( "Attribute containing []", "input[name$='foo[bar]']", ["hidden2"] );
      t( "Attribute containing []", "input[name*='foo[bar]']", ["hidden2"] );
      t( "Multiple Attribute Equals", "#form input[type='radio'], #form input[type='hidden']", ["radio1", "radio2", "hidden1"] );
      t( "Multiple Attribute Equals", "#form input[type='radio'], #form input[type=\"hidden\"]", ["radio1", "radio2", "hidden1"] );
      t( "Multiple Attribute Equals", "#form input[type='radio'], #form input[type=hidden]", ["radio1", "radio2", "hidden1"] );
      t( "Attribute selector using UTF8", "span[lang=中文]", ["台北"] );
      t( "Attribute Begins With", "a[href ^= 'http://www']", ["google","yahoo"] );
      t( "Attribute Ends With", "a[href $= 'org/']", ["mark"] );
      t( "Attribute Contains", "a[href *= 'google']", ["google","groups"] );
      t( "Attribute Is Not Equal", "#ap a[hreflang!='en']", ["google","groups","anchor1"] );
      t("Empty values", "#select1 option[value='']", ["option1a"]);
      t("Empty values", "#select1 option[value!='']", ["option1b","option1c","option1d"]);
      t("Select options via :selected", "#select1 option:selected", ["option1a"] );
      t("Select options via :selected", "#select2 option:selected", ["option2d"] );
      t("Select options via :selected", "#select3 option:selected", ["option3b", "option3c"] );
      t( "Grouped Form Elements", "input[name='foo[bar]']", ["hidden2"] );
    });

    test("pseudo - child", function() {
      expect(31);
      t( "First Child", "p:first-child", ["firstp","sndp"] );
      t( "Last Child", "p:last-child", ["sap"] );
      t( "Only Child", "a:only-child", ["simon1","anchor1","yahoo","anchor2","liveLink1","liveLink2"] );
      t( "Empty", "ul:empty", ["firstUL"] );
      t( "Is A Parent", "p:parent", ["firstp","ap","sndp","en","sap","first"] );
      t( "First Child", "p:first-child", ["firstp","sndp"] );
      t( "Nth Child", "p:nth-child(1)", ["firstp","sndp"] );
      t( "Not Nth Child", "p:not(:nth-child(1))", ["ap","en","sap","first"] );
      // Verify that the child position isn't being cached improperly
      jQuery("p:first-child").after("<div></div>");
      jQuery("p:first-child").before("<div></div>").next().remove();
      t( "First Child", "p:first-child", [] );
      reset();
      t( "Last Child", "p:last-child", ["sap"] );
      t( "Last Child", "a:last-child", ["simon1","anchor1","mark","yahoo","anchor2","simon","liveLink1","liveLink2"] );
      t( "Nth-child", "#main form#form > *:nth-child(2)", ["text1"] );
      t( "Nth-child", "#main form#form > :nth-child(2)", ["text1"] );
      t( "Nth-child", "#form select:first option:nth-child(3)", ["option1c"] );
      t( "Nth-child", "#form select:first option:nth-child(0n+3)", ["option1c"] );
      t( "Nth-child", "#form select:first option:nth-child(1n+0)", ["option1a", "option1b", "option1c", "option1d"] );
      t( "Nth-child", "#form select:first option:nth-child(1n)", ["option1a", "option1b", "option1c", "option1d"] );
      t( "Nth-child", "#form select:first option:nth-child(n)", ["option1a", "option1b", "option1c", "option1d"] );
      t( "Nth-child", "#form select:first option:nth-child(even)", ["option1b", "option1d"] );
      t( "Nth-child", "#form select:first option:nth-child(odd)", ["option1a", "option1c"] );
      t( "Nth-child", "#form select:first option:nth-child(2n)", ["option1b", "option1d"] );
      t( "Nth-child", "#form select:first option:nth-child(2n+1)", ["option1a", "option1c"] );
      t( "Nth-child", "#form select:first option:nth-child(3n)", ["option1c"] );
      t( "Nth-child", "#form select:first option:nth-child(3n+1)", ["option1a", "option1d"] );
      t( "Nth-child", "#form select:first option:nth-child(3n+2)", ["option1b"] );
      t( "Nth-child", "#form select:first option:nth-child(3n+3)", ["option1c"] );
      t( "Nth-child", "#form select:first option:nth-child(3n-1)", ["option1b"] );
      t( "Nth-child", "#form select:first option:nth-child(3n-2)", ["option1a", "option1d"] );
      t( "Nth-child", "#form select:first option:nth-child(3n-3)", ["option1c"] );
      t( "Nth-child", "#form select:first option:nth-child(3n+0)", ["option1c"] );
      t( "Nth-child", "#form select:first option:nth-child(-n+3)", ["option1a", "option1b", "option1c"] );
    });

    test("pseudo - misc", function() {
      expect(6);
      t( "Headers", ":header", ["qunit-header", "qunit-banner", "qunit-userAgent"] );
      t( "Has Children - :has()", "p:has(a)", ["firstp","ap","en","sap"] );
      t( "Text Contains", "a:contains('Google')", ["google","groups"] );
      t( "Text Contains", "a:contains('Google Groups')", ["groups"] );
      t( "Text Contains", "a:contains('Google Groups (Link)')", ["groups"] );
      t( "Text Contains", "a:contains('(Link)')", ["groups"] );
    });

    test("pseudo - :not", function() {
      expect(24);
      t( "Not", "a.blog:not(.link)", ["mark"] );
      t( "Not - multiple", "#form option:not(:contains('Nothing'),#option1b,:selected)", ["option1c", "option1d", "option2b", "option2c", "option3d", "option3e"] );
      t( "Not - recursive", "#form option:not(:not(:selected))[id^='option3']", [ "option3b", "option3c"] );
      t( ":not() failing interior", "p:not(.foo)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not() failing interior", "p:not(div.foo)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not() failing interior", "p:not(p.foo)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not() failing interior", "p:not(#blargh)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not() failing interior", "p:not(div#blargh)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not() failing interior", "p:not(p#blargh)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not Multiple", "p:not(a)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not Multiple", "p:not(a, b)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not Multiple", "p:not(a, b, div)", ["firstp","ap","sndp","en","sap","first"] );
      t( ":not Multiple", "p:not(p)", [] );
      t( ":not Multiple", "p:not(a,p)", [] );
      t( ":not Multiple", "p:not(p,a)", [] );
      t( ":not Multiple", "p:not(a,p,b)", [] );
      t( ":not Multiple", ":input:not(:image,:input,:submit)", [] );
      t( "No element not selector", ".container div:not(.excluded) div", [] );
      t( ":not() Existing attribute", "#form select:not([multiple])", ["select1", "select2"]);
      t( ":not() Equals attribute", "#form select:not([name=select1])", ["select2", "select3"]);
      t( ":not() Equals quoted attribute", "#form select:not([name='select1'])", ["select2", "select3"]);
      t( ":not() Multiple Class", "#foo a:not(.blog)", ["yahoo","anchor2"] );
      t( ":not() Multiple Class", "#foo a:not(.link)", ["yahoo","anchor2"] );
      t( ":not() Multiple Class", "#foo a:not(.blog.link)", ["yahoo","anchor2"] );
    });

    test("pseudo - position", function() {
      expect(25);
      t( "nth Element", "p:nth(1)", ["ap"] );
      t( "First Element", "p:first", ["firstp"] );
      t( "Last Element", "p:last", ["first"] );
      t( "Even Elements", "p:even", ["firstp","sndp","sap"] );
      t( "Odd Elements", "p:odd", ["ap","en","first"] );
      t( "Position Equals", "p:eq(1)", ["ap"] );
      t( "Position Greater Than", "p:gt(0)", ["ap","sndp","en","sap","first"] );
      t( "Position Less Than", "p:lt(3)", ["firstp","ap","sndp"] );
      t( "Check position filtering", "div#nothiddendiv:eq(0)", ["nothiddendiv"] );
      t( "Check position filtering", "div#nothiddendiv:last", ["nothiddendiv"] );
      t( "Check position filtering", "div#nothiddendiv:not(:gt(0))", ["nothiddendiv"] );
      t( "Check position filtering", "#foo > :not(:first)", ["en", "sap"] );
      t( "Check position filtering", "select > :not(:gt(2))", ["option1a", "option1b", "option1c"] );
      t( "Check position filtering", "select:lt(2) :not(:first)", ["option1b", "option1c", "option1d", "option2a", "option2b", "option2c", "option2d"] );
      t( "Check position filtering", "div.nothiddendiv:eq(0)", ["nothiddendiv"] );
      t( "Check position filtering", "div.nothiddendiv:last", ["nothiddendiv"] );
      t( "Check position filtering", "div.nothiddendiv:not(:lt(0))", ["nothiddendiv"] );
      t( "Check element position", "div div:eq(0)", ["nothiddendivchild"] );
      t( "Check element position", "div div:eq(5)", ["t2037"] );
      t( "Check element position", "div div:eq(28)", ["hide"] );
      t( "Check element position", "div div:first", ["nothiddendivchild"] );
      t( "Check element position", "div > div:first", ["nothiddendivchild"] );
      t( "Check element position", "#dl div:first div:first", ["foo"] );
      t( "Check element position", "#dl div:first > div:first", ["foo"] );
      t( "Check element position", "div#nothiddendiv:first > div:first", ["nothiddendivchild"] );
    });

    test("pseudo - form", function() {
      expect(8);
      t( "Form element :input", "#form :input", ["text1", "text2", "radio1", "radio2", "check1", "check2", "hidden1", "hidden2", "name", "search", "button", "area1", "select1", "select2", "select3"] );
      t( "Form element :radio", "#form :radio", ["radio1", "radio2"] );
      t( "Form element :checkbox", "#form :checkbox", ["check1", "check2"] );
      t( "Form element :text", "#form :text:not(#search)", ["text1", "text2", "hidden2", "name"] );
      t( "Form element :radio:checked", "#form :radio:checked", ["radio2"] );
      t( "Form element :checkbox:checked", "#form :checkbox:checked", ["check1"] );
      t( "Form element :radio:checked, :checkbox:checked", "#form :radio:checked, #form :checkbox:checked", ["radio2", "check1"] );
      t( "Selected Option Element", "#form option:selected", ["option1a","option2d","option3b","option3c"] );
    });

    res.die(qunit.getTestResults());

  });

});
