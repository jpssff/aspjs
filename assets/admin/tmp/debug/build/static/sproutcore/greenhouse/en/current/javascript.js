/* >>>>>>>>>> BEGIN bundle_info.js */
        ;(function() {
          var target_name = 'sproutcore/standard_theme' ;
          if (!SC.BUNDLE_INFO) throw "SC.BUNDLE_INFO is not defined!" ;
          if (SC.BUNDLE_INFO[target_name]) return ; 

          SC.BUNDLE_INFO[target_name] = {
            requires: ['sproutcore/empty_theme','sproutcore/debug','sproutcore/testing'],
            styles:   ['/static/sproutcore/standard_theme/en/current/stylesheet.css?1287123524'],
            scripts:  []
          }
        })();

/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ==========================================================================
// Project:   Greenhouse Strings
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

// Place strings you want to localize here.  In your app, use the key and
// localize it using "key string".loc().  HINT: For your key names, use the
// english string with an underscore in front.  This way you can still see
// how your UI will look and you'll notice right away when something needs a
// localized string added to this file_
//
SC.stringsFor('English', {
  // "_String Key": "Localized String"
  "_New File": "New File",
  "_New Folder": "New Folder",
  "_Delete": "Delete",
  "_Top:": "Top:",
  "_Left:": "Left:",
  "_Bottom:": "Bottom:",
  "_Right:": "Right:",
  "_Width:": "Width:",
  "_Height:": "Height:",
  "_Class Names:": "Class Names:",
  "_Background Color:": "Background Color:",
  "_New Page File": "New Page File",
  '_Anchor:': "Anchor:",
  '_Dimensions:': "Dimensions:",
  '_Left:': "Left:",
  '_Width:': "Width:",
  '_Right:': "Right:",
  '_Center X:': "Center X:",
  '_Center Y:': "Center Y:",
  
  '_Top:': "Top:",
  '_Bottom:': "Bottom:",
  '_Height:': "Height:",
  "_Cancel": "Cancel",
  "_Create": "Create",
  "_File Path:": "File Path:",
  "_File Name:": "File Name:",
  "_Page Name:": "Page Name:",
  "_New Page File": "New Page File",
  "_MyApp.mainPage": "MyApp.mainPage",
  "_main_page.js": "main_page.js",
  "_Edit Property:": "Edit Property:",
  "_Key:": "Key:",
  "_Value:": "Value:",
  "_Update": "Update",
  "_Type:": "Type:",
  "_String": "String",
  "_Array": "Array",
  "_Boolean": "Boolean",
  "_Number": "Number",
  "_Function": "Function",
  "_Hash": "Hash",
  "_Object": "Object",
  "_Class": "Class",
  "_Undefined": "Undefined",
  "_Null": "Null",
  "_Class": "Class",
  "_Save": "Save",
  "_Run": "Run",
  "_Library": "Library",
  "_Add": "Add",
  "_Add a Custom Designer to the Library": "Add a Custom Designer to the Library",
  "_MyApp.AwesomeView": "MyApp.AwesomeView",
  "_Class Name:": "Class Name:",
  "_Default Properties:": "Default Properties:",
  "_Item Name": "Item Name",
  "_somethingCool": "somethingCool",
  "_Add View": "Add View",
  "_Specifiy Keys": "Specifiy Keys",
  "_To": "To",
  "_From": "From",
  "_Add Page...": "Add Page...",
  "_Project": "Project",
  "_Dock Library": "Dock Library",
  "_Dock Inspector": "Dock Inspector",
  "_Actions": "Actions",
  "_Inspector": "Inspector",
  "_Reload App": "Reload App",
  "_Target:": "Target:",
  "_Design Type:": "Design Type:",
  "_Add Design": "Add Design"
  
}) ;

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

//better default state name...
SC.DEFAULT_TREE = 'main';

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Object
*/
Greenhouse = SC.Object.create( SC.Statechart,
  /** @scope Greenhouse.prototype */ {

  NAMESPACE: 'Greenhouse',
  VERSION: '0.1.0',
  
  /*
    types fom json
  */
  FILE: 'file',
  DIR: 'dir',
  
  store: SC.Store.create().from('Greenhouse.DataSource'),
  
  //statechart options
  log: YES,
  
  startOnInit: NO,
  
  startStates: {'main': 'loading', 'modals': 'modalReady', 'projectPicker': 'projectPickerClosed', 'library': 'libraryClosed', 'inspector': 'inspectorClosed'},
  
  loadIframeWithPage: function(firstTime){
    var c = Greenhouse.fileController.get('content'), iframe = Greenhouse.get('iframe'), namespace, page;
    var r = c.get('pageRegex'), mainPane;
    namespace = r[1];
    page = r[2];
    
  
    if(namespace && page && iframe){
      if(iframe[namespace] && !iframe[namespace][page]) iframe.eval(c.get('body'));
      
      //just change main view for now...
      namespace = iframe[namespace];
      //setup the designer container
      if(firstTime){
        mainPane = iframe.SC.designPage.get('designMainPane');
        mainPane.append();
      }

      //get the designs...
      namespace[page].set('needsDesigner', YES);
      this.pageController.set('content', namespace[page]);
      
      
      iframe.SC.RunLoop.begin();
      if(!firstTime) iframe.SC.designController.set('content', null);
      iframe.SC.designsController.setDesigns(namespace[page],iframe);
      iframe.SC.designPage.designMainPane.viewList.contentView.set('content', Greenhouse.iframe.SC.designsController.get('content'));
      iframe.SC.RunLoop.end();
    }
  }
});

/* >>>>>>>>>> BEGIN source/beautify.js */
// ==========================================================================
// Project:   Greenhouse
// ==========================================================================
/*globals Greenhouse */
/*

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einar@jsbeautifier.org>
      http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>

  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    js_beautify(js_source_text);
    js_beautify(js_source_text, options);

  The options are:
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    preserve_newlines (default true) — whether existing line breaks should be preserved,
    indent_level (default 0)         — initial indentation level, you probably won't need this ever,

    space_after_anon_function (default false) — if true, then space is added between "function ()"
            (jslint is happy about this); if false, then the common "function()" output is used.
    braces_on_own_line (default false) - ANSI / Allman brace style, each opening/closing brace gets its own line.

    e.g

    js_beautify(js_source_text, {indent_size: 1, indent_char: '\t'});

    
    
    Copyright (c) 2009 Einar Lielmanis

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/
function js_beautify(js_source_text, options) {

    var input, output, token_text, last_type, last_text, last_last_text, last_word, flags, flag_store, indent_string;
    var whitespace, wordchar, punct, parser_pos, line_starters, digits;
    var prefix, token_type, do_block_just_closed;
    var wanted_newline, just_added_newline, n_newlines;


    // Some interpreters have unexpected results with foo = baz || bar;
    options = options ? options : {};
    var opt_braces_on_own_line = options.braces_on_own_line ? options.braces_on_own_line : false;
    var opt_indent_size = options.indent_size ? options.indent_size : 2;
    var opt_indent_char = options.indent_char ? options.indent_char : ' ';
    var opt_preserve_newlines = typeof options.preserve_newlines === 'undefined' ? true : options.preserve_newlines;
    var opt_indent_level = options.indent_level ? options.indent_level : 0; // starting indentation
    var opt_space_after_anon_function = options.space_after_anon_function === 'undefined' ? false : options.space_after_anon_function;
    var opt_keep_array_indentation = typeof options.keep_array_indentation === 'undefined' ? true : options.keep_array_indentation;

    just_added_newline = false;

    // cache the source's length.
    var input_length = js_source_text.length;

    function trim_output() {
        while (output.length && (output[output.length - 1] === ' ' || output[output.length - 1] === indent_string)) {
            output.pop();
        }
    }

    function print_newline(ignore_repeated) {

        flags.eat_next_space = false;
        if (opt_keep_array_indentation && is_array(flags.mode)) {
            return;
        }

        ignore_repeated = typeof ignore_repeated === 'undefined' ? true : ignore_repeated;

        flags.if_line = false;
        trim_output();

        if (!output.length) {
            return; // no newline on start of file
        }

        if (output[output.length - 1] !== "\n" || !ignore_repeated) {
            just_added_newline = true;
            output.push("\n");
        }
        for (var i = 0; i < flags.indentation_level; i += 1) {
            output.push(indent_string);
        }
    }



    function print_single_space() {
        if (flags.eat_next_space) {
            flags.eat_next_space = false;
            return;
        }
        var last_output = ' ';
        if (output.length) {
            last_output = output[output.length - 1];
        }
        if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
            output.push(' ');
        }
    }


    function print_token() {
        just_added_newline = false;
        flags.eat_next_space = false;
        output.push(token_text);
    }

    function indent() {
        flags.indentation_level += 1;
    }


    function remove_indent() {
        if (output.length && output[output.length - 1] === indent_string) {
            output.pop();
        }
    }

    function set_mode(mode) {
        if (flags) {
            flag_store.push(flags);
        }
        flags = {
            mode: mode,
            var_line: false,
            var_line_tainted: false,
            var_line_reindented: false,
            in_html_comment: false,
            if_line: false,
            in_case: false,
            eat_next_space: false,
            indentation_baseline: -1,
            indentation_level: (flags ? flags.indentation_level + (flags.var_line_reindented ? 1 : 0) : opt_indent_level)
        };
    }

    function is_expression(mode) {
        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]' || mode === '(EXPRESSION)';
    }

    function is_array(mode) {
        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]';
    }

    function restore_mode() {
        do_block_just_closed = flags.mode === 'DO_BLOCK';
        if (flag_store.length > 0) {
            flags = flag_store.pop();
        }
    }


    function in_array(what, arr) {
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    }

    // Walk backwards from the colon to find a '?' (colon is part of a ternary op)
    // or a '{' (colon is part of a class literal).  Along the way, keep track of
    // the blocks and expressions we pass so we only trigger on those chars in our
    // own level, and keep track of the colons so we only trigger on the matching '?'.


    function is_ternary_op() {
        var level = 0,
            colon_count = 0;
        for (var i = output.length - 1; i >= 0; i--) {
            switch (output[i]) {
            case ':':
                if (level === 0) {
                    colon_count++;
                }
                break;
            case '?':
                if (level === 0) {
                    if (colon_count === 0) {
                        return true;
                    } else {
                        colon_count--;
                    }
                }
                break;
            case '{':
                if (level === 0) {
                    return false;
                }
                level--;
                break;
            case '(':
            case '[':
                level--;
                break;
            case ')':
            case ']':
            case '}':
                level++;
                break;
            }
        }
    }

    function get_next_token() {
        n_newlines = 0;

        if (parser_pos >= input_length) {
            return ['', 'TK_EOF'];
        }

        wanted_newline = false;

        var c = input.charAt(parser_pos);
        parser_pos += 1;


        var keep_whitespace = opt_keep_array_indentation && is_array(flags.mode);

        if (keep_whitespace) {

            //
            // slight mess to allow nice preservation of array indentation and reindent that correctly
            // first time when we get to the arrays:
            // var a = [
            // ....'something'
            // we make note of whitespace_count = 4 into flags.indentation_baseline
            // so we know that 4 whitespaces in original source match indent_level of reindented source
            //
            // and afterwards, when we get to
            //    'something,
            // .......'something else'
            // we know that this should be indented to indent_level + (7 - indentation_baseline) spaces
            //
            var whitespace_count = 0;

            while (in_array(c, whitespace)) {

                if (c === "\n") {
                    trim_output();
                    output.push("\n");
                    just_added_newline = true;
                    whitespace_count = 0;
                } else {
                    if (c === '\t') {
                        whitespace_count += 4;
                    } else {
                        whitespace_count += 1;
                    }
                }

                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;

            }
            if (flags.indentation_baseline === -1) {
                flags.indentation_baseline = whitespace_count;
            }

            if (just_added_newline) {
                for (var i = 0; i < flags.indentation_level + 1; i += 1) {
                    output.push(indent_string);
                }
                if (flags.indentation_baseline !== -1) {
                    for (var i = 0; i < whitespace_count - flags.indentation_baseline; i++) {
                        output.push(' ');
                    }
                }
            }

        } else {
            while (in_array(c, whitespace)) {

                if (c === "\n") {
                    n_newlines += 1;
                }


                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;

            }

            if (opt_preserve_newlines) {
                if (n_newlines > 1) {
                    for (var i = 0; i < n_newlines; i += 1) {
                        print_newline(i === 0);
                        just_added_newline = true;
                    }
                }
            }
            wanted_newline = n_newlines > 0;
        }


        if (in_array(c, wordchar)) {
            if (parser_pos < input_length) {
                while (in_array(input.charAt(parser_pos), wordchar)) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos === input_length) {
                        break;
                    }
                }
            }

            // small and surprisingly unugly hack for 1E-10 representation
            if (parser_pos !== input_length && c.match(/^[0-9]+[Ee]$/) && (input.charAt(parser_pos) === '-' || input.charAt(parser_pos) === '+')) {

                var sign = input.charAt(parser_pos);
                parser_pos += 1;

                var t = get_next_token(parser_pos);
                c += sign + t[0];
                return [c, 'TK_WORD'];
            }

            if (c === 'in') { // hack for 'in' operator
                return [c, 'TK_OPERATOR'];
            }
            if (wanted_newline && last_type !== 'TK_OPERATOR' && !flags.if_line && (opt_preserve_newlines || last_text !== 'var')) {
                print_newline();
            }
            return [c, 'TK_WORD'];
        }

        if (c === '(' || c === '[') {
            return [c, 'TK_START_EXPR'];
        }

        if (c === ')' || c === ']') {
            return [c, 'TK_END_EXPR'];
        }

        if (c === '{') {
            return [c, 'TK_START_BLOCK'];
        }

        if (c === '}') {
            return [c, 'TK_END_BLOCK'];
        }

        if (c === ';') {
            return [c, 'TK_SEMICOLON'];
        }

        if (c === '/') {
            var comment = '';
            // peek for comment /* ... */
            var inline_comment = true;
            if (input.charAt(parser_pos) === '*') {
                parser_pos += 1;
                if (parser_pos < input_length) {
                    while (! (input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/') && parser_pos < input_length) {
                        c = input.charAt(parser_pos);
                        comment += c;
                        if (c === '\x0d' || c === '\x0a') {
                            inline_comment = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            break;
                        }
                    }
                }
                parser_pos += 2;
                if (inline_comment) {
                    return ['/*' + comment + '*/', 'TK_INLINE_COMMENT'];
                } else {
                    return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
                }
            }
            // peek for comment // ...
            if (input.charAt(parser_pos) === '/') {
                comment = c;
                while (input.charAt(parser_pos) !== "\x0d" && input.charAt(parser_pos) !== "\x0a") {
                    comment += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos >= input_length) {
                        break;
                    }
                }
                parser_pos += 1;
                if (wanted_newline) {
                    print_newline();
                }
                return [comment, 'TK_COMMENT'];
            }

        }

        if (c === "'" || // string
        c === '"' || // string
        (c === '/' && ((last_type === 'TK_WORD' && in_array(last_text, ['return', 'do'])) || (last_type === 'TK_START_EXPR' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EQUALS' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
            var sep = c;
            var esc = false;
            var resulting_string = c;

            if (parser_pos < input_length) {
                if (sep === '/') {
                    //
                    // handle regexp separately...
                    //
                    var in_char_class = false;
                    while (esc || in_char_class || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                            if (input.charAt(parser_pos) === '[') {
                                in_char_class = true;
                            } else if (input.charAt(parser_pos) === ']') {
                                in_char_class = false;
                            }
                        } else {
                            esc = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached. 
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }

                } else {
                    //
                    // and handle string also separately
                    //
                    while (esc || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                        } else {
                            esc = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached. 
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }
                }



            }

            parser_pos += 1;

            resulting_string += sep;

            if (sep === '/') {
                // regexps may have modifiers /regexp/MOD , so fetch those, too
                while (parser_pos < input_length && in_array(input.charAt(parser_pos), wordchar)) {
                    resulting_string += input.charAt(parser_pos);
                    parser_pos += 1;
                }
            }
            return [resulting_string, 'TK_STRING'];
        }

        if (c === '#') {
            // Spidermonkey-specific sharp variables for circular references
            // https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
            // http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
            var sharp = '#';
            if (parser_pos < input_length && in_array(input.charAt(parser_pos), digits)) {
                do {
                    c = input.charAt(parser_pos);
                    sharp += c;
                    parser_pos += 1;
                } while (parser_pos < input_length && c !== '#' && c !== '=');
                if (c === '#') {
                    // 
                } else if (input.charAt(parser_pos) == '[' && input.charAt(parser_pos + 1) === ']') {
                    sharp += '[]';
                    parser_pos += 2;
                } else if (input.charAt(parser_pos) == '{' && input.charAt(parser_pos + 1) === '}') {
                    sharp += '{}';
                    parser_pos += 2;
                }
                return [sharp, 'TK_WORD'];
            }
        }

        if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
            parser_pos += 3;
            flags.in_html_comment = true;
            return ['<!--', 'TK_COMMENT'];
        }

        if (c === '-' && flags.in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
            flags.in_html_comment = false;
            parser_pos += 2;
            if (wanted_newline) {
                print_newline();
            }
            return ['-->', 'TK_COMMENT'];
        }

        if (in_array(c, punct)) {
            while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
                c += input.charAt(parser_pos);
                parser_pos += 1;
                if (parser_pos >= input_length) {
                    break;
                }
            }

            if (c === '=') {
                return [c, 'TK_EQUALS'];
            } else {
                return [c, 'TK_OPERATOR'];
            }
        }

        return [c, 'TK_UNKNOWN'];
    }

    //----------------------------------
    indent_string = '';
    while (opt_indent_size > 0) {
        indent_string += opt_indent_char;
        opt_indent_size -= 1;
    }

    input = js_source_text;

    last_word = ''; // last 'TK_WORD' passed
    last_type = 'TK_START_EXPR'; // last token type
    last_text = ''; // last token text
    last_last_text = ''; // pre-last token text
    output = [];

    do_block_just_closed = false;

    whitespace = "\n\r\t ".split('');
    wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
    digits = '0123456789'.split('');

    punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::'.split(' ');

    // words which should always start on new line.
    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

    // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
    // some formatting depends on that.
    flag_store = [];
    set_mode('BLOCK');

    parser_pos = 0;
    while (true) {
        var t = get_next_token(parser_pos);
        token_text = t[0];
        token_type = t[1];
        if (token_type === 'TK_EOF') {
            break;
        }

        switch (token_type) {

        case 'TK_START_EXPR':

            if (token_text === '[') {

                if (last_type === 'TK_WORD' || last_text === ')') {
                    // this is array index specifier, break immediately
                    // a[x], fn()[x]
                    if (in_array(last_text, line_starters)) {
                        print_single_space();
                    }
                    set_mode('(EXPRESSION)');
                    print_token();
                    break;
                }

                if (flags.mode === '[EXPRESSION]' || flags.mode === '[INDENTED-EXPRESSION]') {
                    if (last_last_text === ']' && last_text === ',') {
                        // ], [ goes to new line
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');
                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    } else if (last_text === '[') {
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');

                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    } else {
                        set_mode('[EXPRESSION]');
                    }
                } else {
                    set_mode('[EXPRESSION]');
                }



            } else {
                set_mode('(EXPRESSION)');
            }

            if (last_text === ';' || last_type === 'TK_START_BLOCK') {
                print_newline();
            } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK') {
                // do nothing on (( and )( and ][ and ]( ..
            } else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                print_single_space();
            } else if (last_word === 'function') {
                // function() vs function ()
                if (opt_space_after_anon_function) {
                    print_single_space();
                }
            } else if (in_array(last_text, line_starters) || last_text === 'catch') {
                print_single_space();
            }
            print_token();

            break;

        case 'TK_END_EXPR':
            if (token_text === ']') {
                if (opt_keep_array_indentation) {
                    if (last_text === '}') {
                        // trim_output();
                        // print_newline(true);
                        remove_indent();
                        print_token();
                        restore_mode();
                        break;
                    }
                } else {
                    if (flags.mode === '[INDENTED-EXPRESSION]') {
                        if (last_text === ']') {
                            restore_mode();
                            print_newline();
                            print_token();
                            break;
                        }
                    }
                }
            }
            restore_mode();
            print_token();
            break;

        case 'TK_START_BLOCK':

            if (last_word === 'do') {
                set_mode('DO_BLOCK');
            } else {
                set_mode('BLOCK');
            }
            if (opt_braces_on_own_line) {
                if (last_type !== 'TK_OPERATOR') {
                    print_newline(true);
                }
                print_token();
                indent();
            } else {
                if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                    if (last_type === 'TK_START_BLOCK') {
                        print_newline();
                    } else {
                        print_single_space();
                    }
                }
                indent();
                print_token();
            }

            break;

        case 'TK_END_BLOCK':
            restore_mode();
            if (opt_braces_on_own_line) {
                print_newline();
                if (flags.var_line_reindented) {
                    output.push(indent_string);
                }
                print_token();
            } else {
                if (last_type === 'TK_START_BLOCK') {
                    // nothing
                    if (just_added_newline) {
                        remove_indent();
                    } else {
                        // {}
                        trim_output();
                    }
                } else {
                    print_newline();
                    if (flags.var_line_reindented) {
                        output.push(indent_string);
                    }
                }
                print_token();
            }
            break;

        case 'TK_WORD':

            // no, it's not you. even I have problems understanding how this works
            // and what does what.
            if (do_block_just_closed) {
                // do {} ## while ()
                print_single_space();
                print_token();
                print_single_space();
                do_block_just_closed = false;
                break;
            }

            if (token_text === 'function') {
                if ((just_added_newline || last_text == ';') && last_text !== '{') {
                    // make sure there is a nice clean space of at least one blank line
                    // before a new function definition
                    n_newlines = just_added_newline ? n_newlines : 0;

                    for (var i = 0; i < 2 - n_newlines; i++) {
                        print_newline(false);
                    }

                }
            }
            if (token_text === 'case' || token_text === 'default') {
                if (last_text === ':') {
                    // switch cases following one another
                    remove_indent();
                } else {
                    // case statement starts in the same line where switch
                    flags.indentation_level--;
                    print_newline();
                    flags.indentation_level++;
                }
                print_token();
                flags.in_case = true;
                break;
            }

            prefix = 'NONE';

            if (last_type === 'TK_END_BLOCK') {
                if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                    prefix = 'NEWLINE';
                } else {
                    if (opt_braces_on_own_line) {
                        prefix = 'NEWLINE';
                    } else {
                        prefix = 'SPACE';
                        print_single_space();
                    }
                }
            } else if (last_type === 'TK_SEMICOLON' && (flags.mode === 'BLOCK' || flags.mode === 'DO_BLOCK')) {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
                prefix = 'SPACE';
            } else if (last_type === 'TK_STRING') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_WORD') {
                prefix = 'SPACE';
            } else if (last_type === 'TK_START_BLOCK') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_END_EXPR') {
                print_single_space();
                prefix = 'NEWLINE';
            }

            if (last_type !== 'TK_END_BLOCK' && in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                print_newline();
            } else if (in_array(token_text, line_starters) || prefix === 'NEWLINE') {
                if (last_text === 'else') {
                    // no need to force newline on else break
                    print_single_space();
                } else if ((last_type === 'TK_START_EXPR' || last_text === '=' || last_text === ',') && token_text === 'function') {
                    // no need to force newline on 'function': (function
                    // DONOTHING
                } else if (last_text === 'return' || last_text === 'throw') {
                    // no newline between 'return nnn'
                    print_single_space();
                } else if (last_type !== 'TK_END_EXPR') {
                    if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
                        // no need to force newline on 'var': for (var x = 0...)
                        if (token_text === 'if' && last_word === 'else' && last_text !== '{') {
                            // no newline for } else if {
                            print_single_space();
                        } else {
                            print_newline();
                        }
                    }
                } else {
                    if (in_array(token_text, line_starters) && last_text !== ')') {
                        print_newline();
                    }
                }
            } else if (prefix === 'SPACE') {
                print_single_space();
            }
            print_token();
            last_word = token_text;

            if (token_text === 'var') {
                flags.var_line = true;
                flags.var_line_tainted = false;
            }

            if (token_text === 'if' || token_text === 'else') {
                flags.if_line = true;
            }

            break;

        case 'TK_SEMICOLON':

            print_token();
            flags.var_line = false;
            break;

        case 'TK_STRING':

            if (last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_SEMICOLON') {
                print_newline();
            } else if (last_type === 'TK_WORD') {
                print_single_space();
            }
            print_token();
            break;

        case 'TK_EQUALS':
            if (flags.var_line) {
                // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
                flags.var_line_tainted = true;
            }
            print_single_space();
            print_token();
            print_single_space();
            break;

        case 'TK_OPERATOR':

            var space_before = true;
            var space_after = true;

            if (flags.var_line && token_text === ',' && (is_expression(flags.mode))) {
                // do not break on comma, for(var a = 1, b = 2)
                flags.var_line_tainted = false;
            }

            if (flags.var_line) {
                if (token_text === ',') {
                    if (flags.var_line_tainted) {
                        print_token();
                        print_newline();
                        output.push(indent_string);
                        flags.var_line_reindented = true;
                        flags.var_line_tainted = false;
                        break;
                    } else {
                        flags.var_line_tainted = false;
                    }
                // } else if (token_text === ':') {
                    // hmm, when does this happen? tests don't catch this
                    // flags.var_line = false;
                }
            }

            if (last_text === 'return' || last_text === 'throw') {
                // "return" had a special handling in TK_WORD. Now we need to return the favor
                print_single_space();
                print_token();
                break;
            }

            if (token_text === ':' && flags.in_case) {
                print_token(); // colon really asks for separate treatment
                print_newline();
                flags.in_case = false;
                break;
            }

            if (token_text === '::') {
                // no spaces around exotic namespacing syntax operator
                print_token();
                break;
            }

            if (token_text === ',') {
                if (flags.var_line) {
                    if (flags.var_line_tainted) {
                        print_token();
                        print_newline();
                        flags.var_line_tainted = false;
                    } else {
                        print_token();
                        print_single_space();
                    }
                } else if (last_type === 'TK_END_BLOCK' && flags.mode !== "(EXPRESSION)") {
                    print_token();
                    print_newline();
                } else {
                    if (flags.mode === 'BLOCK') {
                        print_token();
                        print_newline();
                    } else {
                        // EXPR or DO_BLOCK
                        print_token();
                        print_single_space();
                    }
                }
                break;
            // } else if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS']) || in_array(last_text, line_starters) || in_array(last_text, ['==', '!=', '+=', '-=', '*=', '/=', '+', '-'])))) { 
            } else if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(last_text, line_starters)))) { 
                // unary operators (and binary +/- pretending to be unary) special cases

                space_before = false;
                space_after = false;

                if (last_text === ';' && is_expression(flags.mode)) {
                    // for (;; ++i)
                    //        ^^^
                    space_before = true;
                }
                if (last_type === 'TK_WORD' && in_array(last_text, line_starters)) {
                    space_before = true;
                }

                if (flags.mode === 'BLOCK' && (last_text === '{' || last_text === ';')) {
                    // { foo; --i }
                    // foo(); --bar;
                    print_newline();
                }
            } else if (token_text === '.') {
                // decimal digits or object.property
                space_before = false;

            } else if (token_text === ':') {
                if ( ! is_ternary_op()) {
                    space_before = false;
                }
            }
            if (space_before) {
                print_single_space();
            }

            print_token();

            if (space_after) {
                print_single_space();
            }

            if (token_text === '!') {
                // flags.eat_next_space = true;
            }

            break;

        case 'TK_BLOCK_COMMENT':

            var lines = token_text.split(/\x0a|\x0d\x0a/);

            print_newline();
            output.push(lines[0]);
            for (var i = 1, l = lines.length; i < l; i++) {
                print_newline();
                output.push(' ');
                output.push(lines[i].replace(/^\s\s*|\s\s*$/, ''));
            }

            print_newline();
            break;

        case 'TK_INLINE_COMMENT':

            print_single_space();
            print_token();
            if (is_expression(flags.mode)) {
                print_single_space();
            } else {
                print_newline();
            }
            break;

        case 'TK_COMMENT':

            // print_newline();
            if (wanted_newline) {
                print_newline();
            } else {
                print_single_space();
            }
            print_token();
            print_newline();
            break;

        case 'TK_UNKNOWN':
            print_token();
            break;
        }

        last_last_text = last_text;
        last_type = token_type;
        last_text = token_text;
    }

    return output.join('').replace(/[\n ]+$/, '');
}

/* >>>>>>>>>> BEGIN source/controllers/design.js */
// ==========================================================================
// Project:   Greenhouse.designController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/
Greenhouse.designController = SC.ObjectController.create(
/** @scope Greenhouse.designController.prototype */ {
  contentBinding: 'Greenhouse.pageController*designController.selection',
  contentBindingDefault: SC.Binding.single().oneWay(),
  
  propertySelection: null
  
}) ;

/* >>>>>>>>>> BEGIN source/controllers/file.js */
// ==========================================================================
// Project:   Greenhouse.file
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/
Greenhouse.PAGE_DESIGNER = "pageDesigner";
Greenhouse.BESPIN = "bespin";

Greenhouse.fileController = SC.ObjectController.create(
/** @scope Greenhouse.fileController.prototype */ {

  contentBinding: 'Greenhouse.filesController.selection',
  contentBindingDefault: SC.Binding.single(),
  

  _content_statusDidChange: function(){
    var c = this.get('content');
    if(c && c.get('isPage') ) {
      Greenhouse.sendAction('fileSelectedIsAPage');
      Greenhouse.sendAction('cancel');
    }
    else if (c && !c.get('isPage')){
      Greenhouse.sendAction('fileSelectedIsNotAPage');
    }
  }.observes('*content.body'),
  
  state: null,
  editorMode: '',
  
  // ..........................................................
  // State information
  // 
  //TODO: Rip this crap out...
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.set('state', Greenhouse.PAGE_DESIGNER);
    this.set('editorMode', "pageDesigner");
    
  },
  
  pageDesigner: function(){
    var state = this.get('state');
    switch(state){
      case Greenhouse.BESPIN:
        this.set('state', Greenhouse.PAGE_DESIGNER);
        this.set('editorMode', "pageDesigner");
        break;
      default:
        console.log("RedBull.fileController#pageDesigner not handled in current state %@".fmt(state));
        break;
    }
  },
  
  bespinEditor: function(){
    var state = this.get('state');
    switch(state){
      case Greenhouse.PAGE_DESIGNER:
        this.set('state', Greenhouse.BESPIN);
        this.set('editorMode', "bespinEditor");
        break;
      default:
        console.log("RedBull.fileController#bespinEditor not handled in current state %@".fmt(state));
        break;
    }
  }
  
  
}) ;

/* >>>>>>>>>> BEGIN source/controllers/files.js */
// ==========================================================================
// Project:   Greenhouse.filesController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class


  @extends TreeController
*/
Greenhouse.filesController = SC.TreeController.create(SC.CollectionViewDelegate,
/** @scope Greenhouse.filesController.prototype */ {

  // ..........................................................
  // Drag and drop support
  // 
  collectionViewValidateDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
    return SC.DRAG_ANY;
  },

  collectionViewPerformDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
    console.log('delegate works');
    return SC.DRAG_NONE ;
  },


  treeItemChildrenKey: "contents",
  
  /**
    Call this method whenever you want to relaod the files from the server.
  */
  reload: function() {
    var fileQuery = Greenhouse.FILES_QUERY, target = Greenhouse.targetController.get('content');
    fileQuery.set('urlPath', target.get('name'));
    var files = Greenhouse.store.find(fileQuery), root = SC.Object.create({treeItemIsExpanded: YES});
    root.set('contents', files);
    this.set('content', root);
  }
}) ;

/* >>>>>>>>>> BEGIN source/controllers/layout.js */
// ==========================================================================
// Project:   Greenhouse.layoutController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  Layout controller properties used by the layout palette.  The content should
  be bound to the current page design controller selection.

  @extends SC.ObjectController
*/
Greenhouse.layoutController = SC.ObjectController.create(
/** @scope Greenhouse.layoutController.prototype */ {

  contentBinding: "Greenhouse.pageController.designController.selection",
  allowsMultipleContent: YES, // palette like behavior

  /**
    Determines which set of dimensions should be visible in the layout 
    palette in the horizontal direction.
  */
  hDimNowShowing: function() {
    var loc = this.get('anchorLocation'),
        K   = SC.ViewDesigner, 
        ret = 'leftDimensions';
        
    if (loc & K.ANCHOR_LEFT) ret = 'leftDimensions';
    else if (loc & K.ANCHOR_RIGHT) ret = 'rightDimensions';
    else if (loc & K.ANCHOR_CENTERX) ret = 'centerXDimensions';
    else if (loc & K.ANCHOR_WIDTH) ret = 'widthDimensions';
    return ret ;
  }.property('anchorLocation').cacheable(),
  
  /**
    Determines which set of dimensions should be visible in the layout 
    palette in the vertical direction.
  */
  vDimNowShowing: function() {
    var loc = this.get('anchorLocation'),
        K   = SC.ViewDesigner, 
        ret = 'topDimensions';
        
    if (loc & K.ANCHOR_TOP) ret = 'topDimensions';
    else if (loc & K.ANCHOR_BOTTOM) ret = 'bottomDimensions';
    else if (loc & K.ANCHOR_CENTERY) ret = 'centerYDimensions';
    else if (loc & K.ANCHOR_HEIGHT) ret = 'heightDimensions';
    return ret ;
  }.property('anchorLocation').cacheable()
  
}) ;


/* >>>>>>>>>> BEGIN source/controllers/library.js */
// ==========================================================================
// Project:   Greenhouse.libraryController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class
  Based on SCUI.SearchableTreeController
  http://github.com/etgryphon/sproutcore-ui/blob/master/frameworks/foundation/controllers/searchable_tree.js  
  Thanks to Evin Grano and Brandon Blatnick!
  
  @extends SC.ArrayController
*/

Greenhouse.libraryController = SC.TreeController.create( SC.CollectionViewDelegate,
/** @scope Greenhouse.libraryController.prototype */ {
  /**
    Call this method whenever you want to relaod the library from hte server
  */
  reload: function() {
    var configQuery = Greenhouse.CONFIG_QUERY, target = Greenhouse.targetController.get('content');
    configQuery.set('app', target.get('name'));
    var files = Greenhouse.store.find(configQuery), root = SC.Object.create({treeItemIsExpanded: YES});
    root.set('contents', files);
    this.set('content', root);
  },
  
  views: SC.outlet('content.treeItemChildren.0.treeItemChildren'),
  // ..........................................................
  // Collection View delegate drag methods
  //    
  collectionViewShouldBeginDrag: function(view) { 
    return YES; 
  },

  /**
    Called by the collection view just before it starts a drag so that 
    you can provide the data types you would like to support in the data.

    You can implement this method to return an array of the data types you
    will provide for the drag data.

    If you return null or an empty array, can you have set canReorderContent
    to YES on the CollectionView, then the drag will go ahead but only 
    reordering will be allowed.  If canReorderContent is NO, then the drag
    will not be allowed to start.

    If you simply want to control whether a drag is allowed or not, you
    should instead implement collectionViewShouldBeginDrag().

    The default returns an empty array.

    @param view {SC.CollectionView} the collection view to begin dragging.
    @returns {Array} array of supported data types.
  */
  collectionViewDragDataTypes: function(view) { return ['SC.Object']; },

  /**
    Called by a collection view when a drag concludes to give you the option
    to provide the drag data for the drop.

    This method should be implemented essentially as you would implement the
    dragDataForType() if you were a drag data source.  You will never be asked
    to provide drag data for a reorder event, only for other types of data.

    The default implementation returns null.

    @param view {SC.CollectionView} 
      the collection view that initiated the drag

    @param dataType {String} the data type to provide
    @param drag {SC.Drag} the drag object
    @returns {Object} the data object or null if the data could not be provided.
  */
  collectionViewDragDataForType: function(view, drag, dataType) {
    //store the iframe's frame for use on drop
    var webView = Greenhouse.appPage.getPath('webView');
  
    drag.iframeFrame = webView.get('parentView').convertFrameToView(webView.get('frame'), null);
    var ret = (dataType === 'SC.Object') ? this.get('selection').firstObject() : null;
    return ret ;
  },
  
  ghostActsLikeCursor: YES,
  
  /**
    Renders a drag view for the passed content indexes. If you return null
    from this, then a default drag view will be generated for you.

    @param {SC.CollectionView} view
    @param {SC.IndexSet} dragContent
    @returns {SC.View} view or null
  */
  collectionViewDragViewFor: function(view, dragContent) {
    var dragView = view.itemViewForContentIndex(dragContent.firstObject());
    var layer = view.get('layer').cloneNode(false) ;
    dragView.set('parentView', view) ;
    dragView.set('layer', layer) ;
    dragView.adjust({height: view.get('rowHeight'), top: (dragContent.firstObject()*view.get('rowHeight')) }) ;
    return dragView ;
  },

  /**
    Allows the ghost view created in collectionViewDragViewFor to be displayed
    like a cursor instead of the default implementation. This sets the view 
    origin to be the location of the mouse cursor.

    @property {Boolean} ghost view acts like a cursor
  */
  ghostActsLikeCursor: YES,


  // ..........................................................
  // type ahead search code
  // 
  search: null,
  searchResults: [],
  searchKey: 'name',
  iconKey: 'icon',
  nameKey: 'name',

  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.set('searchResults', []);
    this._runSearch();
  },

  _searchDidChange: function(){
    this._runSearch();
  }.observes('search', 'content'),

 _sanitizeSearchString: function(str){
   var specials = [
       '/', '.', '*', '+', '?', '|',
       '(', ')', '[', ']', '{', '}', '\\'
   ];
   var s = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
   return str.replace(s, '\\$1');
 },

 _runSearch: function(){
   var searchResults = [];
   var search = this.get('search');
   var c = this.get('content');
   if(search === null || search === '' || search === undefined){ 
     this.set('searchResults', c);
   }
   else {
     search = this._sanitizeSearchString(search).toLowerCase();
     var searchRegex = new RegExp(search,'i');
     var searchKey = this.get('searchKey');
     this._iconKey = this.get('iconKey');
     this._nameKey = this.get('nameKey');
     searchResults = this._runSearchOnItem(c, search, searchRegex, searchKey);

     // create the root search tree
     var searchedTree = SC.Object.create({
       treeItemIsExpanded: YES,
       treeItemChildren: searchResults
     });
     this.set('searchResults', searchedTree);
   }
 },

 /** 
   @private
   Returns a flat list of matches for the foldered tree item.
 */
 _runSearchOnItem: function(treeItem, search, searchRegex, searchKey) {
   var searchMatches = [], iconKey = this.get('iconKey'),
       searchedList, key, searchLen, 
       children, nameKey = this._nameKey, that;

   if (SC.none(treeItem)) return searchMatches;

   children = treeItem.get('treeItemChildren');
   if (!children) children = treeItem.get('children');
   that = this;
   children.forEach( function(child){      
     if (child.treeItemChildren) {
       var searchedList = that._runSearchOnItem(child, search, searchRegex, searchKey);
       searchedList.forEach( function(m){ searchMatches.push(m); });
     }

     if (searchKey && child.get(searchKey)) {
       key = child.get(searchKey).toLowerCase();
       if(key.match(searchRegex)){
         var match = SC.Object.create({});
         match[searchKey]  = child.get(searchKey);
         match[nameKey]    = child.get(nameKey);
         match.treeItem    = child;
         match.icon        = child.get(this._iconKey);
         searchMatches.push(match);
       } 
     }
   });

   return searchMatches;
 }
  
}) ;

/* >>>>>>>>>> BEGIN source/controllers/page.js */
// ==========================================================================
// Project:   Greenhouse.page
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/


Greenhouse.pageController = SC.ObjectController.create(
/** @scope Greenhouse.pageController.prototype */ {

}) ;

/* >>>>>>>>>> BEGIN source/controllers/property.js */
// ==========================================================================
// Project:   Greenhouse.propertyController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/


Greenhouse.propertyController = SC.ObjectController.create(
/** @scope Greenhouse.propertyController.prototype */ {
  contentBinding: 'Greenhouse.designController.propertySelection',
  contentBindingDefault: SC.Binding.single()
}) ;

/* >>>>>>>>>> BEGIN source/controllers/property_editor.js */
// ==========================================================================
// Project:   Greenhouse.propertyEditorController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  buffers changes on property editor
  
  @extends SC.ObjectController
*/


Greenhouse.propertyEditorController = SC.ObjectController.create(
/** @scope Greenhouse.propertyEditorController.prototype */ {
}) ;

/* >>>>>>>>>> BEGIN source/controllers/target.js */
// ==========================================================================
// Project:   Greenhouse.target
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/


Greenhouse.targetController = SC.ObjectController.create(
/** @scope Greenhouse.targetController.prototype */ {

  contentBinding: 'Greenhouse.targetsController.selection',
  contentBindingDefault: SC.Binding.single()
}) ;

/* >>>>>>>>>> BEGIN source/controllers/targets.js */
// ==========================================================================
// Project:   Greenhouse.targetsController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  The full set of targets available in the application.  This is populated 
  automatically when you call loadTargets().
  
  
  This Class comes from SproutCore's test runner
  
  
  @extends SC.ArrayController
*/

Greenhouse.targetsController = SC.ArrayController.create(
/** @scope Greenhouse.targetsController.prototype */ {

  /**
    Call this method whenever you want to relaod the targets from the server.
  */
  reload: function() {
    var targets = Greenhouse.store.find(Greenhouse.TARGETS_QUERY);
    this.set('content', targets);
  },
  
  /** 
    Generates the Array of Apps in this project
  */
  applications: function() {

    var apps = [];
    this.forEach(function(target) { 
      if(target.get('sortKind') === "app") apps.pushObject(target);
    }, this);

    return apps;
    
  }.property('[]').cacheable()
}) ;

/* >>>>>>>>>> BEGIN source/controllers/view_configs.js */
// ==========================================================================
// Project:   Greenhouse.viewConfigsController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class
  
  
  @extends SC.ArrayController
*/

Greenhouse.viewConfigsController = SC.ArrayController.create(
/** @scope Greenhouse.viewConfigsController.prototype */ {

  /**
    Call this method whenever you want to relaod the view configs from the server.
  */
  reload: function() {
    var configQuery = Greenhouse.CONFIG_QUERY, target = Greenhouse.targetController.get('content');
    configQuery.set('app', target.get('name'));
    var files = Greenhouse.store.find(configQuery);
    this.set('content', files);
  },
  
  _content_status_changed: function(){
    var c = this.get('content'), that = this;    
    if(c && c.get && c.get('status') && c.get('status') === SC.Record.READY_CLEAN){
      Greenhouse.libraryController.set('content', SC.Object.create({
        treeItemIsExpanded: YES,
        treeItemChildren: [
          SC.Object.create({
            name: 'Views',
            treeItemIsExpanded: YES,
            treeItemChildren: that.get('views')
          }),
          SC.Object.create({
            name: 'Controllers',
            treeItemIsExpanded: YES,
            treeItemChildren: that.get('controllers')
          }),
          SC.Object.create({
            name: 'Panes',
            treeItemIsExpanded: YES,
            treeItemChildren: that.get('panes')
          })
        ]
      }));
    }
  }.observes('*content.status'),
  
  refreshContent: function(){
   this._content_status_changed(); 
  },
  
  /** 
    Generates the arrays of views, panes and controllers that can be dropped into this app
  */
  views: function() {
    return this._collect_all_the_elements('views');
  }.property('[]').cacheable(),
  
  panes: function() {
    return this._collect_all_the_elements('panes');
    
  }.property('[]').cacheable(),
  
  controllers: function() {
    return this._collect_all_the_elements('controllers');
    
  }.property('[]').cacheable(),
  
  
  _collect_all_the_elements: function(key){
    var c = this.get('content'), ret = [], subItem;
    if(c && c.get('length') > 0){
      c.forEach(function(vc){
        subItem = vc.get(key);
        if(subItem){
          subItem.forEach(function(item){
            ret.pushObject(item);
          });
        }
      });
    }
    return ret;
  },
  /*
    lists the editable views
  */
  editable: function(){
    var ret = [], c =this.get('content');
    if(c){
      c.forEach(function(item){
        if(item.get('canEdit') === YES) ret.pushObject(item);
      });
    }
    return ret;
  }.property('content').cacheable()
}) ;

/* >>>>>>>>>> BEGIN source/models/file.js */
// ==========================================================================
// Project:   Greenhouse.File
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*jslint evil: true*/
/*globals Greenhouse*/

require('core');
/** @class

  file properties
  @dir
  @name
  
  @extends SC.ChildRecord
  @version 0.1
*/
Greenhouse.File = SC.ChildRecord.extend(
/** @scope Greenhouse.File.prototype */ {
  type: 'File',
  childRecordNamespace: Greenhouse,
  name: SC.Record.attr(String),
  dir: SC.Record.attr(String),
  body: SC.Record.attr(String),
  primaryKey: 'id',
  
  isFile: YES,

  path: function(){
    return this.get('dir') + this.get('name');
  }.property('name', 'dir').cacheable(),
  
  pageRegex: function(){
    var b = this.get('body'), re =/(\w+)\.(\w+)\s*=\s*SC\.Page\.(design|create)/;
    return b ? b.match(re): b;
  }.property('body').cacheable(),
  
  isPage: function(){
    return this.get('pageRegex') !== null;
  }.property('pageRegex').cacheable(),
  
  pageName: function(){
    var r = this.get('pageRegex') || [];
    return "%@.%@".fmt(r[1],r[2]);
  }.property('pageRegex').cacheable()

}) ;
Greenhouse.FILES_QUERY = SC.Query.remote(Greenhouse.File);
Greenhouse.File.mixin({

});

/* >>>>>>>>>> BEGIN source/core_file.js */
require('core');
require('models/file');
/*
  
THIS IS DEPRECATED...
*/
/*globals Greenhouse */

Greenhouse.mixin({
  
  /*
    @property
  */
  rootFolder: null,
  
  
  loadFileList: function(){
    if(!this._listRequest) this._listRequest = SC.Request.create({type: 'GET', isJSON: YES, address: '/sproutcore/fs?action=list'});
    
    this._listRequest.notify(this,this._listCompleted, {}).send();
  },
  
  _listCompleted: function(request, params){
    var root = Greenhouse.File.create({treeItemIsExpanded: YES});
    var response = this._parse_response(request.response(), root);
    root.set('contents', response);
    this.set('rootFolder', root);
    Greenhouse.filesController.set('content', root);
    Greenhouse.makeFirstResponder(Greenhouse.READY);
    
  },
  
  /*
    wraps everything in an Greenhouse.File object
  */
  _parse_response: function(content, parent){
    for(var i=0; i < content.length; i+=1){
      content[i] = Greenhouse.File.create(content[i]);
      if(content[i].contents){
        content[i].contents = this._parse_response(content[i].contents, content[i]);
      }
      content[i].set('parent',parent);
    }
    return content;
  },
  
  getFile: function(file){
    if(!this._getRequest) this._getRequest = SC.Request.create({type: 'GET'});
    this._getRequest.set('address', "/sproutcore/fs/%@".fmt(file.get('path')));

    this._getRequest.notify(this,this._getCompleted, {file: file}).send();
    
  },
  
  _getCompleted: function(request, params){
    var file = params.file;
    file.requestComplete(request.response());
    //TODO: set content type...
  },
  
  commitFile: function(file){
    if(!this._postRequest) this._postRequest = SC.Request.create({type: 'POST'});
    this._postRequest.set('address', "/sproutcore/fs/%@?action=overwrite".fmt(file.get('path')));
    
    this._postRequest.notify(this,this._commitCompleted, {file: file}).send(file.get('body'));
    
  },
  
  _commitCompleted: function(request, params){
    var file = params.file;
    file.requestComplete();
  },
  /*
    create folder
  
  */
  createFolder: function(file){
    if(!this._postRequest) this._postRequest = SC.Request.create({type: 'POST'});
    this._postRequest.set('address', "/sproutcore/fs/%@?action=mkdir".fmt(file.get('path')));
    
    this._postRequest.notify(this,this._createFolderCompleted,{file: file}).send();
    
  },
  
  _createFolderCompleted: function(request, params){
    var file = params.file;
    file.requestComplete();
  },
  
  /*
    create a file
  
  */
  createFile: function(file){
    if(!this._postRequest) this._postRequest = SC.Request.create({type: 'POST'});
    this._postRequest.set('address', "/sproutcore/fs/%@?action=touch".fmt(file.get('path')));
    
    this._postRequest.notify(this,this._createFileCompleted,{file: file}).send();
    
  },
  
  _createFileCompleted: function(request, params){
    var file = params.file;
    file.requestComplete();
  },
  
  /*
    destroys a file
  
  */
  destroyFile: function(file){
    if(!this._postRequest) this._postRequest = SC.Request.create({type: 'POST'});
    this._postRequest.set('address', "/sproutcore/fs/%@?action=remove".fmt(file.get('path')));
    
    this._postRequest.notify(this,this._destroyFileCompleted,{file: file}).send();
    
  },
  
  _destroyFileCompleted: function(request, params){
    var file = params.file;
    file.requestComplete();
    file.destroy();
  }
});
/* >>>>>>>>>> BEGIN source/data_source.js */
// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010-2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/**
  This DataSource connects to the SproutCore sc-server to retrieve files
*/
Greenhouse.DataSource = SC.DataSource.extend({

  /**
    Fetch a group of records from the data source.  
  */
  fetch: function(store, query) {
    var ret = NO, rt = query.get('recordType');
    if(rt === Greenhouse.File || rt === Greenhouse.Dir){
      ret = this.listFiles(store, query);
    }   
    else if(rt === Greenhouse.Target){
      ret = this.fetchTargets(store, query);
    }
    else if(rt === Greenhouse.ViewConfig){
      ret = this.fetchViewConfigs(store,query);
    }
    return ret;
  },
  
  // ..........................................................
  // Get file list
  // 
  listFiles: function(store, query){
    SC.Request.create({type: 'GET', isJSON: YES, address: '/sproutcore/fs/apps%@/?action=list'.fmt(query.get('urlPath'))})
      .notify(this,this.listFilesDidComplete, {query: query, store: store})
      .send();
  },
  
  listFilesDidComplete: function(request, options){
    var response = request.get('response'),
        query    = options.query,
        store    = options.store,
        storeKeys, recordTypes;
    
    if (!SC.$ok(response)) {
      console.error("Couldn't request files");
    } 
    else {
      recordTypes = response.map(function(item){
        return item.type === 'File' ? Greenhouse.File : Greenhouse.Dir;
      });
      storeKeys = store.loadRecords(recordTypes, response);
      store.loadQueryResults(query, storeKeys);
      Greenhouse.sendAction('fileListCallDidComplete');
    }   
  },
  
  // ..........................................................
  // FETCHING TARGETS
  // 
  
  /**
    Fetch the actual targets.  Only understands how to handle a remote query.
  */
  fetchTargets: function(store, query) {
    
    if (!query.get('isRemote')) return NO ; 
    
    SC.Request.getUrl('/sc/targets.json')
      .set('isJSON', YES)
      .notify(this, 'fetchTargetsDidComplete', { query: query, store: store })
      .send();
    return YES ;
  },
  
  fetchTargetsDidComplete: function(request, opts) {
    var response = request.get('response'),
        query    = opts.query,
        store    = opts.store,
        storeKeys;
        
    if (!SC.$ok(response)) {
      console.error("TODO: Add handler when fetching targets fails");
    } else {
      storeKeys = store.loadRecords(Greenhouse.Target, response);
      store.loadQueryResults(query, storeKeys);
      Greenhouse.sendAction('fetchTargetsDidComplete');
    }
  },
  
  // ..........................................................
  // FETCHING VIEW CONFIGS
  // 
  fetchViewConfigs: function(store, query){
    if (!query.get('isRemote')) return NO ; 
    
    SC.Request.getUrl('/sc/greenhouse-config.json?app=%@'.fmt(query.get('app')))
      .set('isJSON', YES)
      .notify(this, 'fetchViewConfigsDidComplete', { query: query, store: store })
      .send();
    return YES ;
  },
  fetchViewConfigsDidComplete: function(request, opts){
    var response = request.get('response'),
        query    = opts.query,
        store    = opts.store,
        storeKeys;
    if (!SC.$ok(response)) {
      console.error("TODO: Add handler when fetching view configs fails");
    } else {
      storeKeys = store.loadRecords(Greenhouse.ViewConfig, response);
      store.loadQueryResults(query, storeKeys);
    }
  },
  
  // ..........................................................
  // Single File Actions
  // 
  /**
    updates a single record
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  updateRecord: function(store, storeKey, params) {
    var file = store.materializeRecord(storeKey);
    var request = SC.Request.create({type: 'POST', address: "/sproutcore/fs/%@?action=overwrite".fmt(file.get('path')),
         body: file.get('body')})
        .notify(this,this.updateRecordDidComplete, {file: file, storeKey: storeKey, store: store})
        .send();
    return YES ;
  },  
  updateRecordDidComplete: function(response, params){
    var file = params.file, results = response.get('body'), store = params.store;
    if(SC.ok(response)){
      //HACK: for some reason the records are always 514 ready dirty not refreshing dirty...
      status = store.readStatus(params.storeKey);
      store.writeStatus(params.storeKey, SC.Record.BUSY_COMMITTING);
      //end HACK
      params.store.dataSourceDidComplete(params.storeKey);
    }
    else{
      console.error("Couldn't update file!");
    }
  },

  /**
    Called from retrieveRecords() to retrieve a single record.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to retrieve
    @param {String} id the id to retrieve
    @returns {Boolean} YES if handled
  */
  retrieveRecord: function(store, storeKey, params) {
    var file = store.materializeRecord(storeKey), request;
    if(file.kindOf(Greenhouse.File)){
      request = SC.Request.create({type: 'GET', address: "/sproutcore/fs/%@".fmt(file.get('path'))})
          .notify(this, this.retrieveRecordDidComplete, {file: file, storeKey: storeKey, store: store})
          .send();
      return YES;
    }
    return NO;
  },  
  retrieveRecordDidComplete: function(response, params){
    var file = params.file, store = params.store, attributes, status;
    if(SC.ok(response)){
      attributes = file.get('attributes');//SC.clone(file.get('attributes'));
      attributes.body = response.get('body');
      //HACK: for some reason the records are always 514 ready dirty not refreshing dirty...
      status = store.readStatus(params.storeKey);
      store.writeStatus(params.storeKey, SC.Record.BUSY_REFRESH | (status & 0x03)) ;
      //end HACK
      store.dataSourceDidComplete(params.storeKey, attributes);
    }
    else{
      console.error("Couldn't request file");
    }
  },
  /**
    Called from createdRecords() to created a single record.  This is the 
    most basic primitive to can implement to support creating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  createRecord: function(store, storeKey, params) {
    var file = store.materializeRecord(storeKey);
    var request = SC.Request.create({type: 'POST', address: "/sproutcore/fs/%@?action=touch".fmt(file.get('path')),
         body: file.get('body')})
        .notify(this,this.createRecordDidComplete, {file: file, storeKey: storeKey, store: store})
        .send();
    return YES ;
  },  
  createRecordDidComplete: function(response, params){
    var file = params.file, results = response.get('body'), store = params.store;
    if(SC.ok(response)){
      //HACK: for some reason the records are always 514 ready dirty not refreshing dirty...
      status = store.readStatus(params.storeKey);
      store.writeStatus(params.storeKey, SC.Record.BUSY_COMMITTING);
      //end HACK
      params.store.dataSourceDidComplete(params.storeKey);
    }
    else{
      console.error("Couldn't create file!");
    }
  },

  /**
    Called from destroyRecords() to destroy a single record.  This is the 
    most basic primitive to can implement to support destroying a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  destroyRecord: function(store, storeKey, params) {
    var request = SC.Request.create({type: 'POST'}), file = store.materializeRecord(storeKey);
    
    request.set('address', "/sproutcore/fs/%@?action=remove".fmt(file.get('path')));
    
    request.notify(this,this.destroyRecordDidComplete,{file: file, storeKey: storeKey, store: store}).send();
    
    return YES;
  },
  
  destroyRecordDidComplete: function(response, params){
    var status, store = params.store;
    //HACK: for some reason the records are always 514 ready dirty not refreshing dirty...
    status = store.readStatus(params.storeKey);
    store.writeStatus(params.storeKey, SC.Record.BUSY_DESTROYING);
    //end HACK
    params.store.dataSourceDidDestroy(params.storeKey);
  }
  
  
});

/* >>>>>>>>>> BEGIN source/fixtures/file.js */
// ==========================================================================
// Project:   Greenhouse.File Fixtures
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

sc_require('models/file');

Greenhouse.File.FIXTURES = [

  // TODO: Add your data fixtures here.
  // All fixture records must have a unique primary key (default 'guid').  See 
  // the example below.

  // { guid: 1,
  //   firstName: "Michael",
  //   lastName: "Scott" },
  //
  // { guid: 2,
  //   firstName: "Dwight",
  //   lastName: "Schrute" },
  //
  // { guid: 3,
  //   firstName: "Jim",
  //   lastName: "Halpert" },
  //
  // { guid: 4,
  //   firstName: "Pam",
  //   lastName: "Beesly" },
  //
  // { guid: 5,
  //   firstName: "Ryan",
  //   lastName: "Howard" }

];

/* >>>>>>>>>> BEGIN source/lproj/dialogs.js */
// ==========================================================================
// Project:   Greenhouse - dialogs
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

// This page has all the dialogs for greenhouse... 
Greenhouse.dialogPage = SC.Page.design({
  
  modal: SC.PanelPane.design({
    defaultResponder: 'Greenhouse'
  }),
  
  pageFile: SC.View.design({
    layout: {centerX: 0, centerY: 0, width: 350, height: 300},
    childViews: 'title cancel create fileNameLabel fileName filePathLabel filePath pageNameLabel pageName'.w(),
    
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_New Page File".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    
    fileNameLabel: SC.LabelView.design({
      layout: {top: 25, left: 15, right: 5, height: 22},
      value: "_File Name:".loc()
    }),
    fileName: SC.TextFieldView.design({
      layout: {top: 50, left: 15, right: 15, height: 22},
      hint: "_main_page.js".loc(),
      valueBinding: 'Greenhouse.newFileName'
    }),
    
    filePathLabel: SC.LabelView.design({
      layout: {top: 95, left: 15, right: 5, height: 22},
      value: "_File Path:".loc()
    }),
    filePath: SC.TextFieldView.design({
      layout: {top: 115, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.newFilePath'
    }),
    
    pageNameLabel: SC.LabelView.design({
      layout: {top: 160, left: 15, right: 5, height: 22},
      value: "_Page Name:".loc()
    }),
    pageName: SC.TextFieldView.design({
      layout: {top: 180, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.newPageName',
      hint: "_MyApp.mainPage".loc()
      
    }),
    
    cancel: SC.ButtonView.design({
      layout: {bottom: 12, right: 103, width:84, height: 24},
      isCancel: YES,
      action: 'cancel',
      theme: 'capsule',
      title: "_Cancel".loc()
    }),
    create: SC.ButtonView.design({
      layout: {bottom: 12, right: 12, width:84, height: 24},
      isDefault: YES,
      action: 'create',
      theme: 'capsule',
      title: "_Create".loc()
    })
    
  }),
  
  propertyPicker: SC.PickerPane.design({
    layout: {width: 240, height: 290},
    defaultResponder: 'Greenhouse',
    modalPaneDidClick: function(evt) {
      var f = this.get("frame");
      if(!this.clickInside(f, evt)){ 
        Greenhouse.sendAction('cancel');
      }
      return YES ; 
    }
  }),
  
  propertyEditor: SC.View.design({
    childViews: 'title keyLabel key valueLabel value update cancel'.w(),
    
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_Edit Property:".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    
    keyLabel: SC.LabelView.design({
      layout: {top: 25, left: 15, right: 5, height: 22},
      value: "_Key:".loc()
    }),
    key: SC.TextFieldView.design({
      layout: {top: 50, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.propertyEditorController.key'
    }),
    
    // typeLabel: SC.LabelView.design({
    //   layout: {top: 80, left: 15, right: 5, height: 22},
    //   value: "_Type:".loc()
    // }),
    // selectView: SC.SelectFieldView.design({
    //   layout: {top: 100, left: 15, right: 15, height: 22},
    //   valueBinding: 'Greenhouse.propertyEditorController.valueType',
    //   nameKey: 'name',
    //   valueKey: 'value',
    //   objects:[{name: "_String".loc(), value: SC.T_STRING}, {name: "_Array".loc(), value: SC.T_ARRAY},
    //             {name: "_Boolean".loc(), value: SC.T_BOOL}, {name: "_Number".loc(), value: SC.T_NUMBER},
    //             {name: "_Function".loc(), value: SC.T_FUNCTION}, {name: "_Hash".loc(), value: SC.T_HASH},
    //             {name: "_Object".loc(), value: SC.T_OBJECT}, {name: "_Class", value: SC.T_CLASS},
    //             {name: "_Undefined".loc(), value: SC.T_UNDEFINED}, {name: "_Null".loc(), value: SC.T_NULL}]
    // }),
    
    valueLabel: SC.LabelView.design({
      layout: {top: 80, left: 15, right: 5, height: 22},
      value: "_Value:".loc()
    }),
    value: SC.TextFieldView.design({
      layout: {top: 100, left: 15, right: 15, height: 100},
      valueBinding: 'Greenhouse.propertyEditorController.value',
      isTextArea: YES
    }),
    cancel: SC.ButtonView.design({
      layout: {bottom: 5, right: 105, width: 84, height: 24},
      isDefault: NO,
      action: 'cancel',
      theme: 'capsule',
      keyEquivalent: 'escape',
      title: "_Cancel".loc()
    }),
    update: SC.ButtonView.design({
      layout: {bottom: 5, right: 15, width: 84, height: 24},
      isDefault: YES,
      action: 'update',
      theme: 'capsule',
      keyEquivalent: 'return',
      title: "_Update".loc()
    })
  }),
  
  // ..........................................................
  // add custom view panel
  // 
  customViewModal: SC.View.design({
    layout: {centerX: 0, centerY: 0, width: 350, height: 380},
    childViews: 'title cancel add classNameLabel className defaultPropertiesLabel defaultProperties targetLabel targetSelect designTypeLabel designType'.w(),
    
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_Add a Custom Designer to the Library".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    targetLabel: SC.LabelView.design({
      layout: {top: 25, left: 15, right: 5, height: 22},
      value: "_Target:".loc()
    }),
    
    targetSelect: SC.SelectButtonView.design({
      layout: {top: 48, left: 15, right: 15, height: 22},
      objectsBinding: 'Greenhouse.viewConfigsController.editable',
      valueBinding: 'Greenhouse.newDesignViewConfig',
      nameKey: 'name'
    }),
    
    designTypeLabel: SC.LabelView.design({
      layout: {top: 80, left: 15, right: 5, height: 22},
      value: "_Design Type:".loc()
    }),
    
    designType: SC.SelectButtonView.design({
      layout: {top:103, left: 15, right: 15, height: 22},
      objects: [{name: 'Controller', value: 'controllers'}, {name: 'View', value: 'views'}, {name: 'Pane', value: 'panes'}],
      valueBinding: 'Greenhouse.newDesignType',
      nameKey: 'name',
      valueKey: 'value'
    }),
    
    classNameLabel: SC.LabelView.design({
      layout: {top: 130, left: 15, right: 5, height: 22},
      value: "_Class Name:".loc()
    }),
    className: SC.TextFieldView.design({
      layout: {top: 153, left: 15, right: 15, height: 22},
      hint: "_MyApp.AwesomeView".loc(),
      valueBinding: 'Greenhouse.newDesignClass'
    }),
    
    defaultPropertiesLabel: SC.LabelView.design({
      layout: {top: 176, left: 15, right: 5, height: 22},
      value: "_Default Properties:".loc()
    }),
    defaultProperties: SC.TextFieldView.design({
      layout: {top: 199, left: 15, right: 15, height: 135},
      isTextArea: YES,
      valueBinding: 'Greenhouse.newDesignDefaults'
    }),
    
    cancel: SC.ButtonView.design({
      layout: {bottom: 12, right: 103, width:84, height: 24},
      isCancel: YES,
      action: 'cancel',
      theme: 'capsule',
      title: "_Cancel".loc()
    }),
    add: SC.ButtonView.design({
      layout: {bottom: 12, right: 12, width:84, height: 24},
      isDefault: YES,
      action: 'add',
      theme: 'capsule',
      title: "_Add".loc()
    })
  }),
  
  // ..........................................................
  // add item to page
  // 
  newItemForPage: SC.View.design({
    layout: {centerX: 0, centerY: 0, width: 200, height: 120},
    childViews: 'title name cancel add '.w(),
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_Item Name".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    
    name: SC.TextFieldView.design({
      layout: {top: 45, left: 15, right: 15, height: 22},
      hint: "_somethingCool".loc(),
      valueBinding: 'Greenhouse.newPageItemName'
    }),

    cancel: SC.ButtonView.design({
      layout: {bottom: 12, right: 103, width:84, height: 24},
      isCancel: YES,
      action: 'cancel',
      theme: 'capsule',
      title: "_Cancel".loc()
    }),
    
    add: SC.ButtonView.design({
      layout: {bottom: 12, right: 12, width:84, height: 24},
      isDefault: YES,
      action: 'add',
      theme: 'capsule',
      title: "_Add".loc()
    })
  }),
  
  // ..........................................................
  // create new binding
  // 
  //can't have the last word be binding :)
  createBindingView: SC.View.design({
    layout: {centerX: 0, centerY: 0, width: 200, height: 180},
    childViews: 'title from fromText to toText cancel add '.w(),
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_Specifiy Keys".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    
    fromText: SC.LabelView.design({
      layout: {left: 15, top: 30, right: 5, height: 22},
      value: "_From".loc()
    }),
    
    from: SC.TextFieldView.design({
      layout: {top: 48, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.newBindingFromKey'
    }),
    
    toText: SC.LabelView.design({
      layout: {left: 15, top: 78, right: 5, height: 22},
      value: "_To".loc()
    }),
    
    to: SC.TextFieldView.design({
      layout: {top: 96, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.newBindingToKey'
    }),

    cancel: SC.ButtonView.design({
      layout: {bottom: 12, right: 103, width:84, height: 24},
      isCancel: YES,
      action: 'cancel',
      theme: 'capsule',
      title: "_Cancel".loc()
    }),
    
    add: SC.ButtonView.design({
      layout: {bottom: 12, right: 12, width:84, height: 24},
      isDefault: YES,
      action: 'create',
      theme: 'capsule',
      title: "_Add".loc()
    })
  })
  
});

/* >>>>>>>>>> BEGIN source/views/anchor.js */
// ==========================================================================
// Project:   Greenhouse.AnchorView
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Greenhouse.AnchorView = SC.View.extend(
/** @scope Greenhouse.AnchorView.prototype */ {

  /** 
    The anchor location to display
  */
  anchorLocation: null,
  
  /**
    Enabled/disable
  */
  isEnabled: YES,
  
  /**
    Set to YES while the mouse is pressed.
  */
  isActive: NO,
  
  /**
    Proposed anchor location.  Changes as mouse moves/drags
  */
  proposedAnchorLocation: null,
  
  displayProperties: "anchorLocation isEnabled isActive proposedAnchorLocation".w(),
  
  render: function(context, firstTime) {
    if (firstTime) {
      var f = this.get('frame');
      context.begin('canvas')
        .attr('width', f.width).attr('height', f.height)
        .end();
    }
  },
  
  didCreateLayer: function() {
    this.didUpdateLayer();
  },
  
  didUpdateLayer: function() {
    var elem   = this.$('canvas'),
        ctx    = elem[0].getContext("2d"),
        width  = this.$().width(),
        height = this.$().height(),
        loc    = this.get('anchorLocation'), 
        ploc, color, x, y, tmp;

    // adjust size as needed...
    if (Number(elem.attr('width')) !== width) elem.attr('width', width);
    if (Number(elem.attr('height')) !== height) elem.attr('height', height);
    width--; height--; // adjust for being off 0.5

    // do  the drawr-ing!
    if (!this.get('isEnabled')) loc = null;
    color = loc ? 'black' : 'rgb(128,128,128)';
    
    ctx.save();
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.strokeStyle = color;
    ctx.fillRect(0.5, 0.5, width, height);
    ctx.strokeRect(0.5, 0.5, width, height);

    ctx.strokeStyle = color;
    ctx.strokeRect(20.5, 20.5, width-40, height-40);

    ctx.beginPath();
    ctx.moveTo(Math.floor(width/2)+0.5, 20.5);
    ctx.lineTo(Math.floor(width/2)+0.5, Math.floor(height-20)+0.5);
    ctx.moveTo(20.5, Math.floor(height/2)+0.5);
    ctx.lineTo(Math.floor(width-20)+0.5, Math.floor(height/2)+0.5);
    ctx.stroke();
    ctx.restore();

    loc = this.get('anchorLocation');
    
    ploc = this.get('proposedAnchorLocation');
    if (ploc && ploc !== loc) {
      color = this.get('isActive') ? 'rgb(80,80,80)' : 'rgb(200,200,200)';
      this._drawAnchorAt(ploc, ctx, color, width, height);
    }
    
    this._drawAnchorAt(loc, ctx, 'red', width, height);
  },

  // ..........................................................
  // MOUSE EVENTS
  // 
  
  mouseMoved: function(evt) {
    this._updateProposedAnchorLocation(evt);
  },
  
  mouseExited: function(evt) {
    this.setIfChanged('proposedAnchorLocation', null);
  },
  
  mouseDown: function(evt) {
    if (this.get('isEnabled') && this.get('anchorLocation')) {
      this.get('mouseDown');
      
      this.set('isActive', YES);
      this._updateProposedAnchorLocation(evt);
    }
    return YES ;
  },
  
  mouseDragged: function(evt) {
    if (this.get('isActive')) this._updateProposedAnchorLocation(evt);
    return YES ;
  },
  
  mouseUp: function(evt) {
    var loc;

    if (this.get('isActive')) {
      this._updateProposedAnchorLocation(evt);
      loc = this.get('proposedAnchorLocation');
      if (loc) this.setIfChanged('anchorLocation', loc);
      this.set('isActive', NO);
    }
    
    return YES ;
  },

  
  // ..........................................................
  // PRIVATE
  // 

  _updateProposedAnchorLocation: function(evt) {
    var loc = this.get('anchorLocation'),
        pnt = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY },null),
        K   = SC.ViewDesigner,
        rad, f, w, h, ret, centerAnchor, centerResize;            
    
    if (!this.get('isEnabled') || !loc) ret = null;
    else {
      rad = 10;
      f = SC.copy(this.get('frame'));

      // calc outside rect    
      f.x = f.y = 20;
      f.width -= 40 ;
      f.height -= 40;

      if (Math.abs(pnt.x - SC.minX(f))<=rad) w = K.ANCHOR_LEFT;
      else if (Math.abs(pnt.x - SC.midX(f))<=rad) w = K.ANCHOR_CENTERX;
      else if (Math.abs(pnt.x - SC.maxX(f))<=rad) w = K.ANCHOR_RIGHT;
      else w = 0;

      if (Math.abs(pnt.y - SC.minY(f))<=rad) h = K.ANCHOR_TOP;
      else if (Math.abs(pnt.y - SC.midY(f))<=rad) h = K.ANCHOR_CENTERY;
      else if (Math.abs(pnt.y - SC.maxY(f))<=rad) h = K.ANCHOR_BOTTOM;
      else h = 0;

      // not in a regular anchor zone; look for edges...
      if (w===0 || h===0) {
        rad /= 2;
        if (Math.abs(pnt.x - SC.minX(f))<=rad) {
          ret = K.ANCHOR_LEFT | K.ANCHOR_HEIGHT;
        
        } else if (Math.abs(pnt.x - SC.midX(f)) <= rad) {
          ret = K.ANCHOR_CENTERX | K.ANCHOR_HEIGHT;
        
        } else if (Math.abs(pnt.x - SC.maxX(f)) <= rad) {
          ret = K.ANCHOR_RIGHT | K.ANCHOR_HEIGHT;
          
        } else if (Math.abs(pnt.y - SC.minY(f)) <= rad) {
          ret = K.ANCHOR_WIDTH | K.ANCHOR_TOP;

        } else if (Math.abs(pnt.y - SC.midY(f)) <= rad) {
          ret = K.ANCHOR_WIDTH | K.ANCHOR_CENTERY;

        } else if (Math.abs(pnt.y - SC.maxY(f)) <= rad) {
          ret = K.ANCHOR_WIDTH | K.ANCHOR_BOTTOM;
        }
        
      } else ret = w|h;
      if (ret === 0) ret = null;
    }
  
    // alternate between center anchor/resize if options...
    centerAnchor = K.ANCHOR_CENTERX | K.ANCHOR_CENTERY;
    centerResize = K.ANCHOR_WIDTH | K.ANCHOR_HEIGHT;
    if (loc===ret) {
      if (ret===centerAnchor) ret = centerResize;
      else if (ret===centerResize) ret = centerAnchor;
    }
  
    this.setIfChanged('proposedAnchorLocation', ret);
  },
  
    
  _drawAnchorAt: function(loc, ctx, color, width, height) {
    var x = this._xForAnchorLocation(loc, 20, width-40),
        y = this._yForAnchorLocation(loc, 20, height-40),
        tmp;

    // if either is zero - don't do anything
    if (x && y) {
      ctx.save();
      ctx.strokeStyle = color;

      // if x|y < 0, then draw over lines to show height/width
      if (x<0) {
        tmp = Math.floor(Math.abs(y));
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(20.5, tmp, 3, 0, Math.PI*2, true);
        ctx.lineTo(Math.floor(width-20)-3.5, tmp);
        ctx.arc(Math.floor(width-20), tmp, 3, Math.PI, Math.PI*2, true);
        ctx.arc(Math.floor(width-20), tmp, 3, 0, Math.PI, true);
        ctx.stroke();
      } 
      
      if (y<0) {
        tmp = Math.floor(Math.abs(x));
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(tmp, 20.5, 3, 0, Math.PI*2, true);
        ctx.moveTo(tmp, 23.5);
        ctx.lineTo(tmp, Math.floor(height-20)-3.5);
        ctx.arc(tmp, Math.floor(height-20), 3, Math.PI*1.5, Math.PI*2, true);
        ctx.arc(tmp, Math.floor(height-20), 3, 0, Math.PI*1.5, true);
        ctx.stroke();
      } 
      
      if (x>0 && y>0) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.arc(x,y,10,0,Math.PI*2, true);
        ctx.stroke();
      } 

      ctx.restore();
    }
  },
  
  _xForAnchorLocation: function(loc, left, w) {
    var K = SC.ViewDesigner, ret ;
        
    if (loc & K.ANCHOR_LEFT) ret = left;
    else if (loc & K.ANCHOR_RIGHT) ret = left+w;
    else if (loc & K.ANCHOR_CENTERX) ret = left+Math.floor(w/2);
    else if (loc & K.ANCHOR_WIDTH) ret = 0-(left+Math.floor(w/2)) ;
    else ret = 0;
    
    return ret ;
  },

  _yForAnchorLocation: function(loc, top, h) {
    var K = SC.ViewDesigner, ret ;

    if (loc & K.ANCHOR_TOP) ret = top;
    else if (loc & K.ANCHOR_BOTTOM) ret = top+h;
    else if (loc & K.ANCHOR_CENTERY) ret = top+Math.floor(h/2);
    else if (loc & K.ANCHOR_HEIGHT) ret = 0-(top+Math.floor(h/2)) ;
    else ret = 0;
    
    return ret ;
  }

});

/* >>>>>>>>>> BEGIN source/views/plist_item.js */
// ==========================================================================
// Project:   Greenhouse.PlistItemView
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  This class is here to receive custom editor events
  @extends SC.View
*/
Greenhouse.PlistItemView = SC.ListItemView.extend(
/** @scope Greenhouse.ListItem.prototype */ {
 
 
 render: function(context, firstTime){
   var content = this.get('content'),
       del     = this.displayDelegate,
       key, value;
   
   // handle label -- always invoke
   key = this.getDelegateProperty('contentValueKey', del) ;
   value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
   if (value && SC.typeOf(value) !== SC.T_STRING) value = value.toString();
   if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
   value = value + ": " + content.get('value');
   
   this.renderLabel(context, value);
   
   //this.renderValue(context, content);
 },
 
 renderValue: function(context, content){
   
   context.begin('span')
     .addStyle({left: '50%'})
     .push(content.get('value'))
   .end();
 }
});

/* >>>>>>>>>> BEGIN source/lproj/inspectors.js */
// ==========================================================================
// Project:   Greenhouse - inspectorsPage
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
require('views/anchor');
require('views/plist_item');
//This page contains all the inspectors
Greenhouse.inspectorsPage = SC.Page.design({
  
  propertiesInspector: SC.View.design({
    layout: {left: 5, right: 5, top: 0, bottom: 0},
    childViews: 'viewClass list addProperty deleteProperty'.w(),
    
    viewClass: SC.LabelView.design({
      classNames: ['title'],
      layout: {top: 5, left: 5, right: 5, height: 22},
      textAlign: SC.ALIGN_CENTER,
      isEditable: YES,
      valueBinding: 'Greenhouse.designController.viewClass'
    }),
    
    list: SC.ScrollView.design({
      layout: {top: 34, left:0, right: 0, bottom: 30},
      hasHorizontalScroller: NO,
      contentView: SC.ListView.design({
        rowHeight: 44,
        isEditable: NO,
        canEditContent: NO,
        exampleView: Greenhouse.PlistItemView,
        action: 'editProperty',
        contentValueKey: 'key',
        contentBinding: 'Greenhouse.designController.editableProperties',
        selectionBinding: 'Greenhouse.designController.propertySelection'
      })
    }),
    
    addProperty: SC.ButtonView.design({
      classNames:['prop-control', 'dark'],
      layout: { bottom: 0, right: 0, height: 24, width: 35 },
      titleMinWidth: 0,
      hasIcon: NO,
      title: "+",
      action: 'addProperty',
      isEnabledBinding: 'Greenhouse.designController.content'
    }),
    deleteProperty: SC.ButtonView.design({
      classNames:['prop-control', 'dark'],
      layout: { bottom: 0, right: 36, height: 24, width: 35 },
      titleMinWidth: 0,
      hasIcon: NO,
      title: "-",
      action: 'deleteProperty',
      isEnabledBinding: 'Greenhouse.propertyController.content'
    })
  }),
  
  layoutInspector: SC.View.design({

    layout: { top: 18, left: 10, bottom: 10, right: 10 },
    childViews: 'anchorLabel anchorView dimLabel hDimView vDimView'.w(),

    anchorLabel: SC.LabelView.design({
      layout: { top: 0, left: 0, width: 60, height: 18 },
      value: "_Anchor:".loc()
    }),

    anchorView: Greenhouse.AnchorView.design({
      layout: { top: 0, left: 60, right: 10, height: 120 },
      anchorLocationBinding: 'Greenhouse.layoutController.anchorLocation'
    }),
    
    dimLabel: SC.LabelView.design({ 
      layout: { top: 134, left: 0, width: 80, height: 18 },
      value: "_Dimensions:".loc()
    }),
    
    hDimView: SC.ContainerView.design({
      layout: { top: 130, left: 82, right: 10, height: 60 },
      nowShowingBinding: "Greenhouse.layoutController.hDimNowShowing"
    }),
    
    vDimView: SC.ContainerView.design({
      layout: { top: 188, left: 82, right: 10, height: 60 },
      nowShowingBinding: "Greenhouse.layoutController.vDimNowShowing"
    })
    
    
  }),
  
  // ..........................................................
  // LEFT-ALIGNED FIELDS
  // 
  
  leftDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "leftLabel leftField widthLabel widthField".w(),
    
    leftLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Left:".loc()
    }),
    
    leftField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutLeft"
    }),
    
    widthLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Width:".loc()
    }),
    
    widthField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutWidth"
    })    
  }),

  // ..........................................................
  // RIGHT-ALIGNED FIELDS
  // 
  
  rightDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "rightLabel rightField widthLabel widthField".w(),
    
    rightLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Right:".loc()
    }),
    
    rightField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutRight"
    }),
    
    widthLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Width:".loc()
    }),
    
    widthField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutWidth"
    })    
  }),

  // ..........................................................
  // CENTERX-ALIGNED FIELDS
  // 
  
  centerXDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "centerLabel centerField widthLabel widthField".w(),
    
    centerLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Center X:".loc()
    }),
    
    centerField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutCenterX"
    }),
    
    widthLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Width:".loc()
    }),
    
    widthField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutWidth"
    })    
  }),

  // ..........................................................
  // WIDTH-ALIGNED FIELDS
  // 
  
  widthDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "leftLabel leftField rightLabel rightField".w(),
    
    leftLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Left:".loc()
    }),
    
    leftField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutLeft"
    }),
    
    rightLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Right:".loc()
    }),
    
    rightField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutRight"
    })    
  }),
  
  
  // ..........................................................
  // TOP-ALIGNED FIELDS
  // 
  
  topDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "topLabel topField heightLabel heightField".w(),
    
    topLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Top:".loc()
    }),
    
    topField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutTop"
    }),
    
    heightLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Height:".loc()
    }),
    
    heightField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutHeight"
    })    
  }),

  // ..........................................................
  // BOTTOM-ALIGNED FIELDS
  // 
  
  bottomDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "bottomLabel bottomField heightLabel heightField".w(),
    
    bottomLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Bottom:".loc()
    }),
    
    bottomField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutBottom"
    }),
    
    heightLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Height:".loc()
    }),
    
    heightField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutHeight"
    })    
  }),

  // ..........................................................
  // CENTER-Y-ALIGNED FIELDS
  // 
  
  centerYDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "centerYLabel centerYField heightLabel heightField".w(),
    
    centerYLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Center Y:".loc()
    }),
    
    centerYField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutCenterY"
    }),
    
    heightLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Height:".loc()
    }),
    
    heightField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutHeight"
    })    
  }),

  // ..........................................................
  // Height-ALIGNED FIELDS
  // 
  
  heightDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "topLabel topField bottomLabel bottomField".w(),
    
    topLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Top:".loc()
    }),
    
    topField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutTop"
    }),
    
    bottomLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Bottom:".loc()
    }),
    
    bottomField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutBottom"
    })    
  }),
  
  // ..........................................................
  // EXTRAS
  // 
  
  noDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    
    childViews: "labelView".w(),
    labelView: SC.LabelView.design({
      layout: { left: 0, right: 0, height: 18, centerY: 0 },
      textAlign: SC.ALIGN_CENTER,
      value: "_No Dimensions".loc()
    })
  }),
  
  noDimensions2: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    
    childViews: "labelView".w(),
    labelView: SC.LabelView.design({
      layout: { left: 0, right: 0, height: 18, centerY: 0 },
      textAlign: SC.ALIGN_CENTER,
      value: "_No Dimensions".loc()
    })
  })
});

/* >>>>>>>>>> BEGIN source/mixins/drop_down.js */
// ==========================================================================
// Greenhouse.DropDown
// ==========================================================================
/*globals Greenhouse*/

sc_require('core');

/** @mixin
  This mixin allows a toggling view to show/hide a drop-down when the view
  is toggled.  The user should set the 'dropDown' property to a SC.PickerPane or descendant
  class.  When the view is toggled on, an instance of the dropDown will be
  created and shown.
  
  NOTE: This mixin must be used in conjunction with the SCUI.SimpleButton mixin or
        on a SC.ButtonView or descendant.  It needs the target and action properties to work.

  @author Jonathan Lewis
  @author Brandon Blatnick
  
  This Mixin comes from SCUI: http://github.com/etgryphon/sproutcore-ui and is 
  avaliable under the MIT license

*/

Greenhouse.DropDown = {  
  
  isShowingDropDown: NO,
  
  /**
    @private
    Reference to the drop down instance that gets created in init().
  */
  _dropDownPane: null,
  
  dropDown: SC.MenuPane.design({ /* an example menu */
    layout: { width: 100, height: 0 },
    contentView: SC.View.design({}),
    items: ["_item".loc('1'), "_item".loc('2')] // Changed to an array for Localization purposes.
  }),
  
  dropDownType: SC.PICKER_MENU,
  
  initMixin: function() {
    // Try to create a new menu instance
    var dropDown = this.get('dropDown');
    if (dropDown && SC.typeOf(dropDown) === SC.T_CLASS) {
      this._dropDownPane = dropDown.create();
      if (this._dropDownPane) {
        this.bind('isShowingDropDown', '._dropDownPane.isPaneAttached');
      }
    }

    // TODO: [BB] Check for existance of target and action
    if (this.target !== undefined && this.action !== undefined) {
      this.set('target', this);
      this.set('action', 'toggle');
    }  
  },
  
  /**  
    Hides the attached drop down if present.  This is called automatically when
    the button gets toggled off.
  */
  hideDropDown: function() {
    if (this._dropDownPane && SC.typeOf(this._dropDownPane.remove) === SC.T_FUNCTION) {
      this._dropDownPane.remove();
      this.set('isShowingDropDown', NO);
    }
  },

  /**
    Shows the menu.  This is called automatically when the button is toggled on.
  */
  showDropDown: function() {
    // If a menu already exists, get rid of it
    this.hideDropDown();

    // Now show the menu
    if (this._dropDownPane && SC.typeOf(this._dropDownPane.popup) === SC.T_FUNCTION) {
      var dropDownType = this.get('dropDownType');
      this._dropDownPane.popup(this, dropDownType); // show the drop down
      this.set('isShowingDropDown', YES);
    }
  },
  
  /**
    Toggles the menu on/off accordingly
  */
  toggle: function() {
    if (this.get('isShowingDropDown')){
      this.hideDropDown();
    }
    else {
      this.showDropDown();
    }
  }
};

/* >>>>>>>>>> BEGIN source/models/design.js */
// ==========================================================================
// Project:   Greenhouse.Design
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Greenhouse.Design = SC.Record.extend(
/** @scope Greenhouse.Design.prototype */ {
  primaryKey: 'name',
  
  name: SC.Record.attr(String),
  scClass: SC.Record.attr(String),
  defaults: SC.Record.attr(Object)
  
}) ;

/* >>>>>>>>>> BEGIN source/models/dir.js */
// ==========================================================================
// Project:   Greenhouse.Dir
// Copyright: Mike Ball
// ==========================================================================
/*jslint evil: true*/
/*globals Greenhouse*/

require('core');
/** @class

  dir properties
  @dir
  @name
  @contents
  
  @extends SC.ChildRecord
  @version 0.1
*/
Greenhouse.Dir = SC.ChildRecord.extend(
/** @scope Greenhouse.Dir.prototype */ {
  type: 'Dir',
  childRecordNamespace: Greenhouse,
  
  name: SC.Record.attr(String),
  dir: SC.Record.attr(String),  
  contents: SC.Record.toMany('SC.Record', {nested: YES}),
  
  primaryKey: 'id',
  
  
  isFile: NO,

  path: function(){
    return this.get('dir') + this.get('name');
  }.property('name', 'dir').cacheable(),

  
  evalBody: function(){
    var bodyText = this.get('body'), body, designs = [];
    
   try{
      body = eval(bodyText || "");
      body.set('needsDesigner', YES);
      body.set('isContainerView',YES);
      this.set('currentDesign', body);
      for(var v in body){
        if(body.hasOwnProperty(v)){
          if(body[v] && body[v].kindOf){
            if(body[v].kindOf(SC.View)){
              designs.push(SC.Object.create({type: 'view', view: body.get(v), name: v}));
            }
            else if(body[v].kindOf(SC.Page)){
              designs.push(SC.Object.create({type: 'page', view: body.get(v), name: v}));
            }
            else if(body[v].kindOf(SC.Pane)){
              designs.push(SC.Object.create({type: 'pane', view: body.get(v), name: v}));
            }
          }
        }
      }
      this.set('designs', designs);
      
    } catch (exception) {
      console.log("Couldn't eval body...");
      this.set('designs', null);
    }
    
  },
  /*
    if this is a dir then return if the passed
    file's name and type matches
    @returns boolean
  */
  includesFile: function(file){
    if(!this.get('isFile')){
      var contents = this.get('contents'), ret;
      ret = contents.find(function(item){
        if(item.get('type') === file.get('type') && item.get('name') === file.get('name') && item !== file) return YES;
      });
      
      return ret ? YES : NO;
    }
    else{
      return NO;
    }
  }

}) ;

Greenhouse.Dir.mixin({

});

/* >>>>>>>>>> BEGIN source/models/target.js */
// ==========================================================================
// Project:   Greenhouse.Target
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  Describes a target in the build system.

  @extends SC.Record
*/
Greenhouse.Target = SC.Record.extend(
/** @scope Greenhouse.Target.prototype */ {

  primaryKey: "name",
  
  /**
    Name of target.  This is also the primary key.
  */
  name: SC.Record.attr(String),
  
  /**
    Parent of target.  Only non-null for nested targets.
  */
  parent: SC.Record.toOne("Greenhouse.Target"),

  /**
    URL to use to load tests.
  */
  testsUrl: SC.Record.attr(String, { key: "link_tests" }),
  
  /**  
    URL to use to load the app.  If no an app, returns null
  */
  appUrl: function() {
    return (this.get('kind') === 'app') ? this.get('name')+"?designMode=YES" : null;
  }.property('kind', 'name').cacheable(),
  
  /**
    The isExpanded state.  Defaults to NO on load.
  */
  isExpanded: SC.Record.attr(Boolean, { defaultValue: NO }),
  
  /**
    Display name for this target
  */
  displayName: function() {
    var name = (this.get('name') || '(unknown)').split('/');
    return name[name.length-1];
  }.property('name').cacheable(),
  
  /**
    The icon to display.  Based on the type.
  */
  targetIcon: function() {
    var ret = 'sc-icon-document-16';
    switch(this.get('kind')) {
      case "framework":
        ret = 'sc-icon-folder-16';
        break;
        
      case "app":
        ret = 'sc-icon-options-16';
        break;
    }
    return ret ;
  }.property('kind').cacheable(),
  
  /**
    This is the group key used to display.  Will be the kind unless the item
    belongs to the sproutcore target.
  */
  sortKind: function() {
    if (this.get('name') === '/sproutcore') return null;
    var parent = this.get('parent');
    if (parent && (parent.get('name') === '/sproutcore')) return 'sproutcore';
    else return (this.get('kind') || 'unknown').toLowerCase();
  }.property('kind', 'parent').cacheable()
}) ;

Greenhouse.TARGETS_QUERY = SC.Query.remote(Greenhouse.Target);

/* >>>>>>>>>> BEGIN source/models/view_config.js */
// ==========================================================================
// Project:   Greenhouse.ViewConfig
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse js_beautify*/

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Greenhouse.ViewConfig = SC.Record.extend(
/** @scope Greenhouse.ViewConfig.prototype */ {
  
  primaryKey: 'path',
  
  views: SC.Record.toMany('Greenhouse.Design', {nested: YES}),
  panes: SC.Record.toMany('Greenhouse.Design', {nested: YES}),
  controllers: SC.Record.toMany('Greenhouse.Design', {nested: YES}),
  canEdit: SC.Record.attr(Boolean),
  name: SC.Record.attr(String),
  path: SC.Record.attr(String),
  
  body: function(){
    var ret = {name: this.get('name'), path: this.get('path'), views: [], controllers: [], panes: []},
        views = this.get('views'),
        controllers = this.get('controllers'),
        panes = this.get('panes');
    
    
    views.forEach(function(i){
      ret.views.push(i.get('attributes'));
    });
    
    controllers.forEach(function(i){
      ret.controllers.push(i.get('attributes'));
    });
    
    panes.forEach(function(i){
      ret.panes.push(i.get('attributes'));
    });
    
    return js_beautify(SC.json.encode(ret));
  }.property('views', 'panes', 'controllers')
  
}) ;
Greenhouse.CONFIG_QUERY = SC.Query.remote(Greenhouse.ViewConfig);

/* >>>>>>>>>> BEGIN source/states/inspector.js */
// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/*jslint evil: true */

/** @mixin
  @extends Greenhouse
  @author Mike Ball
  @author Evin Grano
  @version RC1
  @since RC1
*/
Greenhouse.mixin( /** @scope Greenhouse */{
  inspectorClosed: SC.State.create({
    
    parallelStatechart: 'inspector',

    // ..........................................................
    // Events
    //
    openInspector: function(anchor){
      if(anchor) Greenhouse.openInspectorPicker.set('anchor', anchor);
      this.goState('openInspectorPicker');
    },
   
    toggleDockedInspector: function(){
      this.goState('dockedInspector');
    },
    
    floatInspector: function(){
      this.goState('inspectorPalette');
    }
  }),
  
  openInspectorPicker: SC.State.create({
    parallelStatechart: 'inspector',

    enterState: function(){
      var ap = Greenhouse.appPage;
      var picker = ap.get('inspectorPicker'),
          pickerContentView = ap.get('inspectorPickerContentView');
      var anchor = this.get('anchor') || ap.getPath('mainView.toolBar.inspector');
      
      pickerContentView.setIfChanged('nowShowing', 'Greenhouse.appPage.inspectorContentView');
      picker.popup(anchor, SC.PICKER_POINTER);
      picker.becomeFirstResponder();
    },
    exitState: function(){
      var ap = Greenhouse.appPage; 
      var picker = ap.get('inspectorPicker'),
          pickerContentView = ap.get('inspectorPickerContentView');
      pickerContentView.setIfChanged('nowShowing', null);
      picker.remove();
      this.set('anchor', null);
    },
   
    // ..........................................................
    // Events
    //
    cancel: function(){
      this.goState('inspectorClosed');
    },
    
    floatInspector: function(){
      this.goState('inspectorPalette');
    },
    
    toggleDockedInspector: function(){
      this.goState('dockedInspector');
    }
  }),
  
  inspectorPalette: SC.State.create({
    parallelStatechart: 'inspector',

    enterState: function(){
      var ap = Greenhouse.appPage; 
      var picker = ap.get('inspectorPicker'),
          pickerContentView = ap.get('inspectorPickerContentView');
          
      pickerContentView.setIfChanged('nowShowing', 'Greenhouse.appPage.inspectorContentView');
      picker.append();
      picker.set('isModal', NO);
      picker.set('isAnchored', NO);
      picker.$().toggleClass('sc-picker', NO);
      var content = ap.getPath('inspectorContentView.content'),
          toolbar = ap.getPath('inspectorContentView.toolbar');
     
      content.adjust('top', 28);    
      toolbar.set('isVisible', YES); 
    },
    exitState: function(){
      var ap = Greenhouse.appPage; 
      var picker = ap.get('inspectorPicker'),
          pickerContentView = ap.get('inspectorPickerContentView');
      
      pickerContentView.setIfChanged('nowShowing', null);
      picker.set('isModal', YES);
      picker.set('isAnchored', YES);
      picker.remove();
     
      var content = ap.getPath('inspectorContentView.content'),
          toolbar = ap.getPath('inspectorContentView.toolbar');
     
      content.adjust('top', 0);    
      toolbar.set('isVisible', NO);
    },
   
    // ..........................................................
    // Events
    //
    closeInspector: function(){
      this.goState('inspectorClosed');
    },
   
    toggleDockedInspector: function(){
      this.goState('dockedInspector');
    }
  }),
 
  dockedInspector: SC.State.create({
    parallelStatechart: 'inspector',

    enterState: function(){
      var iDock = Greenhouse.appPage.get('inspectorDockView');
      iDock.setIfChanged('nowShowing', 'Greenhouse.appPage.inspectorContentView');
    },
    exitState: function(){
      var iDock = Greenhouse.appPage.get('inspectorDockView');
      iDock.setIfChanged('nowShowing', null);
    },
 
    // ..........................................................
    // Events
    //
    toggleDockedInspector: function(){
      var libState = Greenhouse.get('libraryClosed').state();
      if (libState !== Greenhouse.get('dockedLibrary')) Greenhouse.sendEvent('undock');
      this.goState('inspectorClosed');
    }
  })
});

/* >>>>>>>>>> BEGIN source/states/library.js */
// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010Mike Ball
// ==========================================================================
/*globals Greenhouse */
/*jslint evil: true */

/** @mixin
  @extends Greenhouse
  @author Mike Ball
  @author Evin Grano
  @version RC1
  @since RC1
*/
Greenhouse.mixin( /** @scope Greenhouse */{
  libraryClosed: SC.State.create({
    parallelStatechart: 'library',
   
    // ..........................................................
    // Events
    //
    openLibrary: function(){
      this.goState('openLibraryPicker');
    },
   
    toggleDockedLibrary: function(){
      this.goState('dockedLibrary');
    }
  }),
  
  openLibraryPicker: SC.State.create({
    
    parallelStatechart: 'library',
    
    enterState: function(){
      var picker = Greenhouse.appPage.get('libraryPicker'),
          button = Greenhouse.appPage.getPath('mainView.toolBar.library'),
          pickerContentView = Greenhouse.appPage.get('libraryPickerContentView');
      
      pickerContentView.setIfChanged('nowShowing', 'Greenhouse.appPage.libraryContentView');
      picker.popup(button, SC.PICKER_POINTER);
      picker.becomeFirstResponder();
    },
   
    exitState: function(){
      var picker = Greenhouse.appPage.get('libraryPicker'),
          pickerContentView = Greenhouse.appPage.get('libraryPickerContentView');
      pickerContentView.setIfChanged('nowShowing', null);
      picker.remove();
    },
   
    cancel: function(){
      this.goState('libraryClosed');
    },
    
    floatLibrary: function(){
      this.goState('libraryPalette');
    },
    
    toggleDockedLibrary: function(){
      this.goState('dockedLibrary');
    }
  }),
 
  libraryPalette: SC.State.create({
    parallelStatechart: 'library',

    enterState: function(){
      var ap = Greenhouse.appPage;
      var picker = ap.get('libraryPicker'),
          pickerContentView = ap.get('libraryPickerContentView');
          
      pickerContentView.setIfChanged('nowShowing', 'Greenhouse.appPage.libraryContentView');
      picker.append();
      picker.set('isModal', NO);
      picker.set('isAnchored', NO);
      picker.$().toggleClass('sc-picker', NO);
      var content = ap.getPath('libraryContentView.content'),
          toolbar = ap.getPath('libraryContentView.toolbar');
     
      content.adjust('top', 49);    
      toolbar.set('isVisible', YES); 
    },
    exitState: function(){
      var ap = Greenhouse.appPage;
      var picker = ap.get('libraryPicker'),
          pickerContentView = ap.get('libraryPickerContentView');
      
      pickerContentView.setIfChanged('nowShowing', null);
      picker.set('isModal', YES);
      picker.set('isAnchored', YES);
      picker.remove();
     
      var content = ap.getPath('libraryContentView.content'),
          toolbar = ap.getPath('libraryContentView.toolbar');
     
      content.adjust('top', 49);    
      toolbar.set('isVisible', NO);
    },
    
    closeLibrary: function(){
      this.goState('libraryClosed');
    },
    
    toggleDockedLibrary: function(){
      this.goState('dockedLibrary');
    }
  }),
 
  dockedLibrary: SC.State.create({

    parallelStatechart: 'library',

    enterState: function(){
      var libDock = Greenhouse.appPage.get('libraryDockView');
      libDock.setIfChanged('nowShowing', 'Greenhouse.appPage.libraryContentView');
    },
    exitState: function(){
      var libDock = Greenhouse.appPage.get('libraryDockView');
      libDock.setIfChanged('nowShowing', null);
    },
  
    // ..........................................................
    // Events
    //
    toggleDockedLibrary: function(){
      var iState = Greenhouse.get('inspectorClosed').state();
      if (iState !== Greenhouse.get('dockedInspector')) Greenhouse.sendEvent('undock');
      
      this.goState('libraryClosed');
    }
  })
});

/* >>>>>>>>>> BEGIN source/states/modals.js */
// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/*jslint evil: true */

/** @mixin
  @extends Greenhouse
  @author Mike Ball
  @author Evin Grano
  @version RC1
  @since RC1
*/
Greenhouse.mixin( /** @scope Greenhouse */{
  modalReady: SC.State.create({
 
    parallelStatechart: 'modals',

    newBindingPopup: function(item){
      Greenhouse.createBindingPopup.set('newItem', item);
      this.goState('createBindingPopup');
    },
    
    newCustomView: function(){
      this.goState('addCustomView');
    },
    
    editProperty: function(){
      this.goState('editProperties');
    },

    newPageElement: function(item){
      Greenhouse.set('newItem', item);
      this.goState('addToPage');
    },
    openProjectPicker: function(){
      this.goState('projectPicker');
    }
  }),
  
  projectPicker: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      var picker = Greenhouse.appPage.get('projectPicker'),
          button = Greenhouse.appPage.getPath('mainView.toolBar.project');

      picker.popup(button, SC.PICKER_POINTER);
      picker.becomeFirstResponder();
    },
    exitState: function(){
      var picker = Greenhouse.appPage.get('projectPicker');
      picker.remove();
    },
    
    cancel: function(){
      this.goState('modalReady');
    },
    
    newPageFile: function(){
      this.goState('newPage');
    }
  }),
  
  
  createBindingPopup: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      Greenhouse.set("newBindingFromKey", null);
      Greenhouse.set("newBindingToKey", null);
      var modal = Greenhouse.dialogPage.get('modal');
      modal.set('contentView', Greenhouse.dialogPage.get('createBindingView'));
      modal.set('layout', {centerX: 0, centerY: 0, width: 200, height: 180});
      modal.append();
    },
    exitState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.remove();
      Greenhouse.set("newBindingFromKey", null);
      Greenhouse.set("newBindingToKey", null);
      this.set('newItem', null);
    },
    cancel: function(){
      this.goState('modalReady');
    },

    create: function(){
      var fromKey = Greenhouse.get("newBindingFromKey"),
          toKey = Greenhouse.get("newBindingToKey"),
          newItem = this.get('newItem'),
          view = Greenhouse.designController.get('view'), 
          c = Greenhouse.designController.get('content');

      if(view && c){
        Greenhouse.designController.propertyWillChange('content');
        var designAttrs = c.get('designAttrs');
        if(designAttrs) designAttrs = designAttrs[0];
        newItem.addItem(fromKey, toKey, designAttrs);
        Greenhouse.designController.propertyDidChange('content');
      }

      this.goState('modalReady');
    }
    
  }),
  
  addCustomView: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.set('contentView', Greenhouse.dialogPage.get('customViewModal'));
      modal.set('layout', {centerX: 0, centerY: 0, width: 350, height: 380});
      Greenhouse.set('newDesignClass', null);
      Greenhouse.set('newDesignDefaults', null);
      Greenhouse.set('newDesignViewConfig', null);
      Greenhouse.set('newDesignType', null);
      modal.append();
    },
    exitState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.remove();
      Greenhouse.set('newDesignClass', null);
      Greenhouse.set('newDesignDefaults', null);
      Greenhouse.set('newDesignViewConfig', null);
      Greenhouse.set('newDesignType', null);
      
    },
    
    cancel: function(){
      this.goState('modalReady');
    },

    add: function(){
      var viewConfig = Greenhouse.get('newDesignViewConfig');
      var array = viewConfig.get(Greenhouse.get('newDesignType'));
      
      var newView = array.pushObject({name: Greenhouse.get('newDesignClass'), 
                         scClass: Greenhouse.get('newDesignClass'), 
                         defaults: eval("("+Greenhouse.get('newDesignDefaults')+")")});

      viewConfig.commitRecord();
      Greenhouse.viewConfigsController.notifyPropertyChange(Greenhouse.get('newDesignType'));
      Greenhouse.viewConfigsController.refreshContent();
            
      this.goState('modalReady');
    }
  }),
  
  newPage: SC.State.create({
    parentState: 'projectPicker',
    parallelStatechart: 'modals',

    enterState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.set('contentView', Greenhouse.dialogPage.get('pageFile'));
      modal.set('layout', {centerX: 0, centerY: 0, width: 350, height: 300});

      Greenhouse.set('newFileName', null);
      Greenhouse.set('newFilePath', Greenhouse.fileController.get('path'));
      Greenhouse.set('newPageName', null);

      modal.append();
    },
    exitState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.remove();
      Greenhouse.set('newFileName', null);
      Greenhouse.set('newFilePath', null);
      Greenhouse.set('newPageName', null);
    },
    
    cancel: function(){
      this.goState('projectPicker');
    },

    create: function(){
      var f = Greenhouse.fileController.get('content'), ret, child, page = Greenhouse.get('newPageName'),
          fileName = Greenhouse.get('newFileName'), filePath = Greenhouse.get('newFilePath') + "/";

      if(!fileName.match(/\.js/)) fileName = fileName + ".js";

      ret = ['// SproutCore ViewBuilder Design Format v1.0',
        '// WARNING: This file is automatically generated.  DO NOT EDIT.  Changes you',
        '// make to this file will be lost.', '',
        '%@ = SC.Page.design({});'.fmt(page),''].join("\n");

      var contents = f.get('contents');

      contents.pushObject({type: 'File', dir: filePath, name: fileName, body:ret});
      child = contents.objectAt(contents.get('length') - 1);
      child.commitRecord();

      this.goState('projectPicker');
    }
  }),
  
  editProperties: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      var picker = Greenhouse.dialogPage.get('propertyPicker');
      picker.set('contentView', Greenhouse.dialogPage.get('propertyEditor'));
      var list = Greenhouse.inspectorsPage.getPath('propertiesInspector.list.contentView');
      var content = Greenhouse.propertyController.get('content');

      //TODO: I should probably popup this picker in the plist item view....
      picker.popup(list.itemViewForContentObject(content));
      picker.becomeFirstResponder();

      //TODO: copy correct here? 
      Greenhouse.propertyEditorController.set('content', SC.copy(content));
    },
    exitState: function(){
      var picker = Greenhouse.dialogPage.get('propertyPicker');
      picker.remove();
      Greenhouse.propertyEditorController.set('content', null);
    },
    
    cancel: function(){
      this.goState('modalReady');
    },

    update: function(){
      var val = Greenhouse.propertyEditorController.get('value'), 
          view = Greenhouse.propertyEditorController.get('view'),
          key = Greenhouse.propertyEditorController.get('key'),
          origKey = Greenhouse.propertyController.get('key'),
          content = Greenhouse.designController.get('content'), designAttrs;



      // designAttrs = content.get('designAttrs');
      //  if(designAttrs) designAttrs = designAttrs[0];
 
      if(key !== origKey){
        view[origKey] = undefined;
        delete view[origKey];
        view.designer.designProperties.removeObject(origKey);
        view.designer.designProperties.pushObject(key);
        view.designer.propertyDidChange('editableProperties');
        //delete designAttrs[origKey];
      }

      view[key] = eval(val);
      view.propertyDidChange(key);
      if(view.displayDidChange) view.displayDidChange();

      Greenhouse.propertyController.set('key',key);
      Greenhouse.propertyController.set('value', val);

      this.goState('modalReady');
    }
  }),
  
  addToPage: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      Greenhouse.set('newPageItemName', '');
      var modal = Greenhouse.dialogPage.get('modal');
      modal.set('contentView', Greenhouse.dialogPage.get('newItemForPage'));
      modal.set('layout', {width: 200, height: 120, centerX: 0, centerY: 0});
      modal.append();
    },
    exitState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.remove();
      Greenhouse.set('newItem', null);
      Greenhouse.set('newPageItemName', '');
    },
    cancel: function(){
      this.goState('modalReady');
    },

    add: function(){
      var newItem = Greenhouse.get('newItem'),
          name = Greenhouse.get('newPageItemName');

      newItem.addItemToPage(name);
      this.goState('modalReady');
    }
  })
});

/* >>>>>>>>>> BEGIN source/states/ready.js */
// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse js_beautify*/
/** @mixin
  @extends Greenhouse
  @author Mike Ball
  @author Evin Grano
  @version RC1
  @since RC1
*/
Greenhouse.mixin( /** @scope Greenhouse */{
  // ..........................................................
  // Ready States
  // 
  ready: SC.State.create({

    enterState: function(){
      console.log('greenhouse has landed');
      var c = Greenhouse.getPath('mainPage.mainPane.container');
      c.set('nowShowing', Greenhouse.getPath('appPage.mainView'));
    },
    exitState: function(){

    },
    
    // ..........................................................
    //  Events
    // 
    run: function(){
      var target = Greenhouse.targetController.get('name');
      window.open(target, "","");
    },
    
    selectFile: function(){
      var c = Greenhouse.fileController.get('content');
      if(c) {
        c.refresh();
        this.goState('gettingFile');
      }
    },
    
    unselectFile: function(){
     // TODO: [EG, MB] add the action for unselecting 
     this.goState('readyWaiting');
    },
     
    reloadIframe: function(){
      Greenhouse.filesController.set('selection', null);
      Greenhouse.gettingFile._firstTime = YES;

      Greenhouse.iframe.location.reload();
      this.goState('iframeLoading');
    }
  }),
  
  readyWaiting: SC.State.create({
    
    parentState: 'ready',

    enterState: function(){
      
    },
    exitState: function(){

    }
    
  }),
  
  gettingFile: SC.State.create({
    
    parentState: 'ready',
    
    initState: function(){
      this._firstTime = YES;
    },
    
    enterState: function(){
      //TODO draw spinner
    },
    exitState: function(){
    },
    
    fileSelectedIsAPage: function(){
      Greenhouse.loadIframeWithPage(this._firstTime);
      this._firstTime = NO;
      this.goHistoryState('pageSelected');
    },
    
    fileSelectedIsNotAPage: function(){
      this.goState('fileSelected');
    }
  }),
  
  fileSelected: SC.State.create({

    parentState: 'ready',

    enterState: function(){
      //TODO: draw message saing we can't do anythign with this right now...
    },
    exitState: function(){}
  }),
  
  pageSelected: SC.State.create({

    parentState: 'ready',
    initialSubState: 'noDock',

    enterState: function(){},
    exitState: function(){},
    
    // ..........................................................
    // Events
    // 
    save: function(){
      var designPage, content = Greenhouse.fileController.get('content');
      designPage = Greenhouse.iframe.SC.designsController.get('page');
      //check if this page has a name...
      designPage.setPath('designController.selection', null);
      if(!designPage.get('pageName')) designPage.set('pageName', content.get('pageName'));
      designPage = designPage.emitDesign();
      content.set('body', js_beautify(designPage));
      content.commitRecord(); 
    },
    addProperty: function(){
      var designer = Greenhouse.designController.get('content');

      if(designer){
        designer.designProperties.pushObject("newProperty"); //TODO: generate better name....
        designer.propertyDidChange('editableProperties');
      }
    },
    deleteProperty: function(){
      var prop = Greenhouse.propertyController.get('content'),
          designer = Greenhouse.designController.get('content'),
          view;
      if(prop && designer){
        view = prop.view;
        view[prop.view] = undefined;
        delete view[prop.key]; //FIXME: [MB] this isn't removing the property...
        designer.designProperties.removeObject(prop.key);
        view.propertyDidChange(prop.key);
        if(view.displayDidChange) view.displayDidChange();
        designer.propertyDidChange('editableProperties');
      }
    }
  }),
  
  noDock: SC.State.create({
    parentState: 'pageSelected',

    enterState: function(){
      var dock = Greenhouse.appPage.get('dockView');
      dock.set('layout', {top: 0, bottom: 0, right: 0, width: 0});
      var design = Greenhouse.appPage.get('designAreaView');
      design.set('layout', {top: 0, bottom: 0, right: 0, left: 0});
    },
    exitState: function(){

    },
   
    // ..........................................................
    // Events
    //
    toggleDockedLibrary: function(){
      this.goState('docked');
    },

    toggleDockedInspector: function(){
      this.goState('docked');
    }
  }),

  docked: SC.State.create({
    parentState: 'pageSelected',

    enterState: function(){
      var dock = Greenhouse.appPage.get('dockView');
      dock.set('layout', {top: 0, bottom: 0, right: 0, width: 230});
      var design = Greenhouse.appPage.get('designAreaView');
      design.set('layout', {top: 0, left: 0, right: 230, bottom: 0});
    },
    exitState: function(){

    },
   
    // ..........................................................
    // Events
    //
    undock: function(){
      this.goState('noDock');
    }
 })
  
});

/* >>>>>>>>>> BEGIN source/views/application_list_item.js */
// ==========================================================================
// Project:   Greenhouse.ApplicationListItem
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  This class is here to receive custom editor events
  @extends SC.View
*/
Greenhouse.ApplicationListItem = SC.ListItemView.extend(
/** @scope Greenhouse.ApplicationListItem.prototype */ {
  render: function(context, firstTime) {
    if(this.get('contentIndex') === 0) context.addClass('first')
    arguments.callee.base.apply(this,arguments);
  }
  
});

/* >>>>>>>>>> BEGIN source/views/event_blocker.js */
// ==========================================================================
// Project:   Greenhouse.EventBlocker
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class
  prevents drag events from hitting iframe 
  
  thanks to Jonathan Lewis
  @extends SC.View
*/
Greenhouse.EventBlocker = SC.View.extend(
/** @scope Greenhouse.EventBlocker.prototype */ {
  
  isVisible: NO,
    
  dragStarted: function(drag, evt) {
    this.set('isVisible', YES);
  },
  dragEnded: function(drag, evt) {
    this.set('isVisible', NO);
  },
  
  isDropTarget: YES,
  
  mouseMoved: function(evt){
    return this.get('isVisible');
  },
  mouseDragged: function(evt){
    return this.get('isVisible');
  }
});

/* >>>>>>>>>> BEGIN source/views/label_designer.js */
// ========================================================================
// Greenhouse.LabelView.Designer
// ========================================================================

/*
  A Custom Designer for LabelViews.
  
  This custom designer allows you to set classNames and backgroundColor
*/

SC.LabelView.Designer = SC.LabelView.Designer.extend(
/** @scope SC.LabelView.Designer.prototype */ {
  
  designProperties: 'value escapeHTML classNames backgroundColor'.w()
  
});
/* >>>>>>>>>> BEGIN source/views/list_item.js */
// ==========================================================================
// Project:   Greenhouse.ListItem
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  This class is here to receive custom editor events
  @extends SC.View
*/
Greenhouse.ListItem = SC.ListItemView.extend(
/** @scope Greenhouse.ListItem.prototype */ {
  /**
    Called just after the inline editor has ended editing. You can use this 
    method to save the final value of the inline editor and to perform any 
    other cleanup you need to do.
    
    @param inlineEditor {SC.InlineTextFieldView} the inline editor
    @param finalValue {Object} the final value
    @returns {void}
  */
  // inlineEditorDidEndEditing: function(inlineEditor, finalValue) {
  //   var content = this.get('content');
  //   var parent = content.get('parent'), newContent = SC.copy(content);
  //   newContent.set('name', finalValue);
  // 
  //   
  //   //check for duplicates on parent's contents array
  //   if(parent && parent.includesFile(newContent)){
  //     SC.AlertPane.warn("You've already got something named that", "Just pick something different");
  //     finalValue = content.get('name');
  //     arguments.callee.base.apply(this,arguments);
  //   }
  //   else{
  //     arguments.callee.base.apply(this,arguments);
  //     
  //     //send change to server
  //     content.commit();
  //   }
  // }
  
});

/* >>>>>>>>>> BEGIN source/views/simple_button.js */
// ==========================================================================
// Greenhouse.SimpleButton
// ==========================================================================
/*globals Greenhouse*/
/*jslint evil: true */

/** @class
  
  This view come from SCUI.SimpleButton
  
  Mixin to allow for simple button actions...
  
  
  This Mixin comes from SCUI: http://github.com/etgryphon/sproutcore-ui and is 
  avaliable under the MIT license
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/
Greenhouse.SimpleButton = {
/* SimpleButton Mixin */
  target: null,
  action: null,
  hasState: NO,
  hasHover: NO,
  inState: NO,
  _hover: NO,
  stateClass: 'state',
  hoverClass: 'hover',
  activeClass: 'active', // Used to show the button as being active (pressed)
  
  _isMouseDown: NO, 
  
  displayProperties: ['inState'],

  /** @private 
    On mouse down, set active only if enabled.
  */    
  mouseDown: function(evt) {
    //console.log('SimpleButton#mouseDown()...');
    if (!this.get('isEnabledInPane')) return YES ; // handled event, but do nothing
    //this.set('isActive', YES);
    this._isMouseDown = YES;
    this.displayDidChange();
    return YES ;
  },

  /** @private
    Remove the active class on mouseOut if mouse is down.
  */  
  mouseExited: function(evt) {
    //console.log('SimpleButton#mouseExited()...');
    if ( this.get('hasHover') ){ 
      this._hover = NO; 
      this.displayDidChange();
    }
    //if (this._isMouseDown) this.set('isActive', NO);
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseEntered: function(evt) {
    //console.log('SimpleButton#mouseEntered()...');
    if ( this.get('hasHover') ){ 
      this._hover = YES; 
      this.displayDidChange();
    }
    //this.set('isActive', this._isMouseDown);
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  mouseUp: function(evt) {
    if (!this.get('isEnabledInPane')) return YES;
    //console.log('SimpleButton#mouseUp()...');
    //if (this._isMouseDown) this.set('isActive', NO); // track independently in case isEnabled has changed
    this._isMouseDown = false;
    // Trigger the action
    var target = this.get('target') || null;
    var action = this.get('action');    
    // Support inline functions
    if (this._hasLegacyActionHandler()) {
      // old school... 
      this._triggerLegacyActionHandler(evt);
    } else {
      // newer action method + optional target syntax...
      this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
    }
    if (this.get('hasState')) {
      this.set('inState', !this.get('inState'));
    }
    this.displayDidChange();
    return YES;
  },
  
  renderMixin: function(context, firstTime) {
    if (this.get('hasHover')) { 
      var hoverClass = this.get('hoverClass');
      context.setClass(hoverClass, this._hover && !this._isMouseDown); // addClass if YES, removeClass if NO
    }
    
    if (this.get('hasState')) {
      var stateClass = this.get('stateClass');
      context.setClass(stateClass, this.inState); // addClass if YES, removeClass if NO
    }
    
    var activeClass = this.get('activeClass');
    context.setClass(activeClass, this._isMouseDown);
    
    // If there is a toolTip set, grab it and localize if necessary.
    var toolTip = this.get('toolTip') ;
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      if (this.get('localize')) toolTip = toolTip.loc();
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }
  },  
  
  /**
    @private
    From ButtonView 
    Support inline function definitions
   */
  _hasLegacyActionHandler: function(){
    var action = this.get('action');
    if (action && (SC.typeOf(action) === SC.T_FUNCTION)) return true;
    if (action && (SC.typeOf(action) === SC.T_STRING) && (action.indexOf('.') !== -1)) return true;
    return false;
  },

  /** @private */
  _triggerLegacyActionHandler: function(evt){
    var target = this.get('target');
    var action = this.get('action');

    // TODO: [MB/EG] Review: MH added the else if so that the action executes
    // in the scope of the target, if it is specified.
    if (target === undefined && SC.typeOf(action) === SC.T_FUNCTION) {
      this.action(evt);
    }
    else if (target !== undefined && SC.typeOf(action) === SC.T_FUNCTION) {
      action.apply(target, [evt]);
    }
    
    if (SC.typeOf(action) === SC.T_STRING) {
      eval("this.action = function(e) { return "+ action +"(this, e); };");
      this.action(evt);
    }
  }
  
};


/* >>>>>>>>>> BEGIN source/views/tear_off_picker.js */
// ==========================================================================
// Project:   Greenhouse.TearOffPicker
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  @extends SC.PickerPane
*/
Greenhouse.TearOffPicker = SC.PickerPane.extend(
/** @scope Greenhouse.TearOffPicker.prototype */ {
    
  dragAction: '',
  
  mouseDragged: function(evt){
    
    Greenhouse.sendAction(this.get('dragAction'));
    this._blockedIframe = YES;
    Greenhouse.eventBlocker.set('isVisible', YES);
    
    return arguments.callee.base.apply(this,arguments);
  },
  
  mouseUp: function(evt){
    if(this._blockedIframe){
      Greenhouse.eventBlocker.set('isVisible', NO);
      this._blockedIframe = NO;
    }
    return arguments.callee.base.apply(this,arguments);
  },
  
  mouseDown: function(evt) {
    var f=this.get('frame');
    this._mouseOffsetX = f ? (f.x - evt.pageX) : 0;
    this._mouseOffsetY = f ? (f.y - evt.pageY) : 0;
    return this.modalPaneDidClick(evt);
  },
  
  modalPaneDidClick: function(evt) {
    var f = this.get("frame");
    if(!this.clickInside(f, evt)){ 
      Greenhouse.sendAction('cancel');
    }
    return YES ; 
  },
  
  computeAnchorRect: function(anchor) {
    var ret = SC.viewportOffset(anchor); // get x & y
    var cq = SC.$(anchor);
    var wsize = SC.RootResponder.responder.computeWindowSize() ;
    ret.width = cq.outerWidth();
    ret.height = (wsize.height-ret.y) < cq.outerHeight() ? (wsize.height-ret.y) : cq.outerHeight();
    ret.y = ret.y -11;
    return ret ;
  }
});

/* >>>>>>>>>> BEGIN source/views/web.js */
// ==========================================================================
// Project:   Greenhouse.WebView
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  provides access to the iframes memoryspace
  @extends SC.WebView
*/
Greenhouse.WebView = SC.WebView.extend(
/** @scope Greenhouse.WebView.prototype */ {
  
  iframeDidLoad: function() {
    //fit the iframe to size of the contents.
    if (this.get('shouldAutoResize') === YES){
      var contentWindow;
      var iframeElt = this.$('iframe')[0];
      if(iframeElt && iframeElt.contentWindow){
        contentWindow = iframeElt.contentWindow;
        this.contentWindow = contentWindow;
        if(contentWindow && contentWindow.document && contentWindow.document.documentElement){
          var docElement = contentWindow.document.documentElement;
          // setting the width before the height gives more accurate results.. 
          // atleast for the test iframe content i'm using.
          //TODO: try out document flows other than top to bottom.
          if (!SC.browser.isIE){
            this.$().width(docElement.scrollWidth);
            this.$().height(docElement.scrollHeight);          
          } else {
            this.$().width(docElement.scrollWidth + 12);
            this.$().height(docElement.scrollHeight + 5);          
          }
        }
      }
    }
    else{
      var iframe = this.$('iframe')[0];
      if(iframe) this.contentWindow = iframe.contentWindow;
    }
    Greenhouse.set('iframe', this.contentWindow);
    Greenhouse.sendAction('iframeLoaded');
  }
});

/* >>>>>>>>>> BEGIN source/lproj/app_page.js */
// ==========================================================================
// Project:   Greenhouse - appPage
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
require('views/list_item');
require('views/web');
require('views/tear_off_picker');
require('mixins/drop_down');
require('views/simple_button');
// This page has the main UI layout
Greenhouse.appPage = SC.Page.design({
  
  mainView: SC.View.design({
    layout: { top: -1, bottom: 0, left: 0, right: 0 },
    childViews: 'mainContainer toolBar'.w(),
    defaultResponder: "Greenhouse",
    
    mainContainer: SC.ContainerView.design({
      layout: { left: 0, top: 46, right: 0, bottom: 0 },
      nowShowingBinding: 'Greenhouse.fileController.editorMode' 
    }),
    
    toolBar: SC.ToolbarView.design({
      layout: { left: 0, right: 0, top: 0, height: 46 },
      anchorLocation: SC.ANCHOR_TOP,
      classNames: ['toolbar'],

      childViews: 'logo project save run title library inspector action '.w(),
      
      logo: SC.View.design({
        layout: {left: 20, width: 131, height: 32, centerY: -1},
        classNames: ['greenhouse-logo-s']
      }),
      
      project: SC.ButtonView.design({
        toolTip: "_Project".loc(),
        classNames: ['dark'],
        layout: {left: 171, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'projects',
        action: 'openProjectPicker'
      }),
      
      save: SC.ButtonView.design({
        toolTip: "_Save".loc(),
        classNames: ['dark'],
        layout: {left: 251, centerY: -1, width: 47, height: 24},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'save',
        action: 'save'
      }),
      
      run: SC.ButtonView.design({
        toolTip: "_Run".loc(),
        classNames: ['dark'],
        layout: {left: 304, centerY: -1, width: 47, height: 24},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'run',
        action: 'run'
      }),
      
      title: SC.LabelView.design({
        layout: {centerX: 75, centerY: -2, height: 24, width: 300 },
        classNames: ['title'],
        textAlign: SC.ALIGN_CENTER,
        valueBinding: SC.Binding.oneWay('Greenhouse.fileController.name')
      }),
      
      library: SC.ButtonView.design({
        toolTip: "_Library".loc(),
        classNames: ['dark'],
        layout: {right: 153, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'library',
        action: 'openLibrary'
      }),
      
      inspector: SC.ButtonView.design({
        toolTip: "_Inspector".loc(),
        classNames: ['dark'],
        layout: {right: 100, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'inspector',
        action: 'openInspector'
      }),
      
      action: SC.ButtonView.design(Greenhouse.DropDown, {
        classNames: ['dark'],
        layout: {right: 20, centerY: -1, width: 47, height: 24},
        titleMinWidth: 37,
        hasIcon: YES,
        toolTip: "_Actions".loc(),
        icon: 'actions',
        dropDown: SC.MenuPane.design({
          defaultResponder: 'Orion',
          layout: { width: 140, height: 0 },
          itemTitleKey: 'title',
          itemTargetKey: 'target',
          itemActionKey: 'action',
          itemSeparatorKey: 'isSeparator',
          itemIsEnabledKey: 'isEnabled',
          items:[
            {title: "_Run".loc(), action: 'run', isEnabled: YES},
            {title: "_Reload App".loc(), action: 'reloadIframe', isEnabled: YES},
            {title: "_Dock Library".loc(), action: 'toggleDockedLibrary', isEnabled: YES},
            {title: "_Dock Inspector".loc(), action: 'toggleDockedInspector', isEnabled: YES},
            {title: "_Save".loc(), action: 'save', isEnabled: YES }
          ]
        })
      })
      
    })
    
  }),
  
  // Outlets to design views
  designAreaView: SC.outlet('pageDesigner.designArea'),
  webView: SC.outlet('pageDesigner.designArea.web'),
  eventBlocker: SC.outlet('pageDesigner.designArea.eventBlocker'),
  
  // Outlets to Docks
  dockView: SC.outlet('pageDesigner.dock'),
  libraryDockView: SC.outlet('pageDesigner.dock.libraryArea'),
  inspectorDockView: SC.outlet('pageDesigner.dock.inspectorArea'),
  
  pageDesigner: SC.View.design({
    layout: { left: 0, top: 0, right: 0, bottom: 0 },
    childViews: 'designArea dock'.w(),
    
    designArea: SC.View.design({
      layout: {top: 0, left: 0, right: 0, bottom: 0},
      classNames: ['workspace'],
      childViews: 'web eventBlocker'.w(),

      web: Greenhouse.WebView.design({
        valueBinding:'Greenhouse.targetController.appUrl'
      }),

      eventBlocker: Greenhouse.EventBlocker.design({})
    }),
    
    dock: SC.View.design({
      layout: {top: 0, bottom: 0, right: 0, width: 0},
      childViews: 'libraryArea inspectorArea'.w(),
      classNames: ['anchored'],
      
      libraryArea: SC.ContainerView.design({
        classNames: ['library-docked'],
        layout: { left: 0, top: 0, right: 0, bottom: 386 },
        nowShowing: null
      }),

      inspectorArea: SC.ContainerView.design({
        classNames: ['inspector-docked'],
        layout: { right: 0, bottom: 0, left: 0, height: 385 },
        nowShowing: null
      })
    })
  }),
  
  inspectorContentView: SC.View.design({
    childViews: 'toolbar content'.w(),
  
    toolbar: SC.View.design({
      layout: {top:0, left: 0, right:0, height: 28},
      isVisible: NO,
      childViews: 'title remove'.w(),
      title: SC.LabelView.design({
        layout: {centerX: 0, top: 2, height: 24, width: 50},
        title: "_Inspector".loc()
      }),
      
      remove: SC.View.design(Greenhouse.SimpleButton,{
        classNames: ['close-button'],
        layout: {right: 1, top: 6, width: 18, height: 17},
        action: 'closeInspector'
      })
    }),
  
    content: SC.TabView.design({
      layout: { left: 6, right: 6, bottom: 6, height: 368 },
      itemTitleKey: 'title',
      itemValueKey: 'value',
      nowShowing: 'Greenhouse.inspectorsPage.layoutInspector',
      items: [
        {title: "Layout", value: 'Greenhouse.inspectorsPage.layoutInspector'},
        {title: "All Properties", value: 'Greenhouse.inspectorsPage.propertiesInspector'}]
    })
  }),
  
  // inspectorTab: SC.TabView.design({
  //   layout: {left: 0, right:0, bottom: 0, height:350},
  //   itemTitleKey: 'title',
  //   itemValueKey: 'value',
  //   nowShowing: 'Greenhouse.inspectorsPage.layoutInspector',
  //   items: [
  //     {title: "Layout", value: 'Greenhouse.inspectorsPage.layoutInspector'},
  //     {title: "All Properties", value: 'Greenhouse.inspectorsPage.propertiesInspector'}]
  // }),
  
  inspectorPickerContentView: SC.outlet('inspectorPicker.contentView'), 
  inspectorPicker: Greenhouse.TearOffPicker.design({
    classNames: ['gh-picker', 'inspector'],
    layout: {width: 230, height: 380},
    defaultResponder: 'Greenhouse',
    dragAction: 'floatInspector',
    contentView: SC.ContainerView.design({
      nowShowing: 'Greenhouse.appPage.inspectorContentView'
    })
  }),
  
  // ..........................................................
  // Library Views
  // 
  libraryContentView: SC.View.design({
    childViews: 'controlBar toolbar content'.w(),
    
    controlBar: SC.View.design({
      classNames: ['control-bar'],
      layout: { left: 10, right: 10, top: 12, height: 24 },
      childViews: 'search'.w(),
      
      search: SC.TextFieldView.design({
        classNames: ['search'],
        layout: {top: 0, centerX: 0, width: 180, height: 24 },
        valueBinding: 'Greenhouse.libraryController.search'
      })
    }),
    
    toolbar: SC.View.design({
      layout: {top:0, left: 0, right:0, height: 28},
      isVisible: NO,
      childViews: 'remove'.w(),
      remove: SC.View.design(Greenhouse.SimpleButton,{
        classNames: ['close-button'],
        layout: {right: 1, top: 6, width: 18, height: 17},
        action: 'closeLibrary'
      })
    }),
    
    content: SC.View.design({
      classNames: ['content'],
      layout: { top: 49, bottom: 11, left: 8, right: 8 },
      childViews: 'library addCustomView'.w(),
    
      library: SC.ScrollView.design({
        classNames: ['library-list'],
        layout: {top: 0, bottom: 32, left: 0, right: 0 },
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          rowHeight: 36,
          isEditable: NO,
          contentValueKey: 'name',
          contentBinding: 'Greenhouse.libraryController.arrangedObjects',
          selectionBinding: 'Greenhouse.libraryController.selection',
          delegate: Greenhouse.libraryController,
          canReorderContent: YES,
          dragDidBegin: function(drag, loc) {
            Greenhouse.sendAction('cancel');
          }
        })
      }),
    
      addCustomView: SC.ButtonView.design({
        classNames: ['dark'],
        layout: { bottom: 1, right: 0, height: 24, width: 90 },
        titleMinWidth: 0,
        hasIcon: NO,
        title: "_Add Design".loc(),
        action: 'newCustomView'
      })
    })
  }),
  
  libraryPickerContentView: SC.outlet('libraryPicker.contentView'),
  libraryPicker: Greenhouse.TearOffPicker.design({
    classNames: ['gh-picker'],
    layout: {width: 230, height: 400},
    dragAction: 'floatLibrary',
    defaultResponder: 'Greenhouse',
    contentView: SC.ContainerView.design({
      nowShowing: 'Greenhouse.appPage.libraryContentView'
    })
  }),
  
  // ..........................................................
  // Project Views
  // 
  projectPicker: SC.PickerPane.design({
    classNames: ['gh-picker'],
    layout: {width: 200, height: 500},
    defaultResponder: 'Greenhouse',
    computeAnchorRect: function(anchor) {
      var ret = SC.viewportOffset(anchor); // get x & y
      var cq = SC.$(anchor);
      var wsize = SC.RootResponder.responder.computeWindowSize() ;
      ret.width = cq.outerWidth();
      ret.height = (wsize.height-ret.y) < cq.outerHeight() ? (wsize.height-ret.y) : cq.outerHeight();
      ret.y = ret.y -11;
      return ret ;
    },
    modalPaneDidClick: function(evt) {
      var f = this.get("frame");
      if(!this.clickInside(f, evt)){ 
        Greenhouse.sendAction('cancel');
      }
      return YES ; 
    },
    contentView: SC.View.design({
      childViews: 'controlBar fileList'.w(),
      
      controlBar: SC.View.design({
        classNames: ['control-bar'],
        layout: { left: 10, right: 10, top: 12, height: 24 },
        childViews: 'addPage'.w(),
        
        addPage: SC.ButtonView.design({
          classNames: ['dark'],
          layout: { width: 90, height: 24, left: 0 },
          titleMinWidth: 0,
          hasIcon: NO,
          title: "_Add Page...".loc(),
          action: 'newPageFile'
        })
      }),

      fileList: SC.ScrollView.design({
        classNames: ['content'],
        layout: { top: 49, bottom: 11, left: 8, right: 8 },
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          exampleView: Greenhouse.ListItem,
          isEditable: NO,
          canEditContent: YES,
          actOnSelect: YES,
          //canReorderContent: YES,
          deelegate: Greenhouse.filesController,
          contentValueKey: 'name',
          contentBinding: 'Greenhouse.filesController.arrangedObjects',
          selectionBinding: 'Greenhouse.filesController.selection',
          action: 'selectFile'
       })
      })


      // fileActions: SC.ButtonView.design(Greenhouse.DropDown, {
      //   layout: { bottom: 5, left: 10, height: 24, width: 35 },
      //   titleMinWidth: 0,
      //   hasIcon: NO,
      //   title: '+',
      //   icon: 'file-actions-icon',
      //   dropDown: SC.MenuPane.design({
      //     defaultResponder: 'Greenhouse',
      //     contentView: SC.View.design({}),
      //     layout: { width: 140, height: 0 },
      //     itemTitleKey: 'title',
      //     itemActionKey: 'action',
      //     itemSeparatorKey: 'isSeparator',
      //     itemIsEnabledKey: 'isEnabled',
      //     items: [
      //       { title: "_New File".loc(), action: 'newFile', isEnabled: YES },
      //       { title: "_New Page File".loc(), action: 'newPageFile', isEnabled: YES },
      //       { title: "_New Folder".loc(), action: 'newFolder', isEnabled: YES },
      //       { title: "_Delete".loc(), action: 'deleteFile', isEnabled: YES }
      // 
      //     ]
      //   })
      // })
    })
  })
});

/* >>>>>>>>>> BEGIN source/lproj/main_page.js */
// ==========================================================================
// Project:   Greenhouse - mainPage
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
sc_require('views/application_list_item');
// This page describes the main user interface for your application.  
Greenhouse.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    
    defaultResponder: "Greenhouse",
    
    childViews: 'container'.w(),
    container: SC.ContainerView.design({
      nowShowing: ''
    })
  }),
  
  loading: SC.LabelView.design({
    layout: { bottom: 0, height: 30, left: 0, right: 0},
    value: 'Loading...',
    textAlign: SC.ALIGN_CENTER,
    classNames: ['footer']
  }),
  
  appPicker: SC.View.design({
    childViews: 'scLogo picker footer warning'.w(),
    classNames: ['app-picker'],
    
    scLogo: SC.View.design({
      layout: { width: 140, left: 10, top: 10, height: 32 },
      classNames: ['sc-logo']
    }),
    
    picker: SC.View.design({
      layout: { width: 548, height: 400, centerX: -102, centerY: -60},
      childViews: 'ghLogo prompt scrollView button'.w(),
      classNames: ['app-picker'],
    
      ghLogo: SC.View.design({
        layout: { width: 279, left: 168, top: 0, height: 64 },
        classNames: ['greenhouse-logo-l']
      }),
    
      prompt: SC.View.design({
        layout: { width: 175, left: 0, top: 62, height: 128 },
        classNames: ['helper']
      }),
    
      button: SC.ButtonView.design({
        layout: { bottom: 12, height: 28, width: 140, right: 0 },
        isEnabledBinding: "Greenhouse.targetController.content",
        title: "Load Application",
        theme: "capsule",
        isDefault: YES,
        action: "loadApplication"
      }),
    
      scrollView: SC.ScrollView.design({
        layout: { right: 0, top: 60, width: 332, bottom: 54 },
        hasHorizontalScroller: NO,
      
        contentView: SC.ListView.design({  
          rowHeight: 41,
          exampleView: Greenhouse.ApplicationListItem,
          contentBinding: "Greenhouse.targetsController.applications",
          selectionBinding: "Greenhouse.targetsController.selection",        
          contentValueKey: "displayName",
          contentIconKey: "targetIcon",
          hasContentIcon: YES,
          action: "loadApplication"
        })
      
      })
    
    }),
    
    warning: SC.LabelView.design({
      layout: {bottom: 60, centerX: 0, width: 400, height: 58},
      value: "NOTE: Greenhouse is under active development and not yet ready for general use.  At the moment, Greenhouse works best with Google Chrome."
    }),
    
    footer: SC.LabelView.design({
      layout: { bottom: 0, height: 30, left: 0, right: 0},
      value: '©2010 Sprout Systems Inc. & Contributors',
      textAlign: SC.ALIGN_CENTER,
      classNames: ['footer']
    })
    
  }) 
});

/* >>>>>>>>>> BEGIN source/resources/test_page.js */
// SproutCore ViewBuilder Design Format v1.0
// WARNING: This file is automatically generated.  DO NOT EDIT.  Changes you
// make to this file will be lost.
Greenhouse.TestPage = SC.Page.design({
  mainView: SC.View.design({
    childViews: [SC.ButtonView.design({
      layout: {
        "width": 100,
        "height": 24,
        "top": 444,
        "left": 685
      },
      title: "dork",
      isDefault: YES
    })]
  }),
  myView: SC.View.design({
    childViews: [SC.ButtonView.design({
      layout: {
        "width": 100,
        "height": 24,
        "top": 208,
        "left": 49
      }
    }), SC.ButtonView.design({
      layout: {
        "width": 100,
        "height": 24,
        "top": 58,
        "left": 83
      }
    })]
  }),
  someView: SC.View.design({}),
  myC: SC.ObjectController.design({}),
  pageName: "Greenhouse.TestPage"
});

/* >>>>>>>>>> BEGIN source/main.js */
// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse bespin*/

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Greenhouse.main = function main() {

  // Step 1: Instantiate Your Views
  // The default code here will make the mainPane for your application visible
  // on screen.  If you app gets any level of complexity, you will probably 
  // create multiple pages and panes.  
  Greenhouse.getPath('mainPage.mainPane').append() ;
  
  //start the state machine
  Greenhouse.targetsController.reload();
  Greenhouse.startupStatechart();
  
} ;

function main() { Greenhouse.main(); }

/* >>>>>>>>>> BEGIN source/states/main.js */
// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @mixin
  @extends Greenhouse
  @author Mike Ball
  @author Evin Grano
  @version RC1
  @since RC1
*/
Greenhouse.mixin( /** @scope Greenhouse */{
    
  loading: SC.State.create({
    
    enterState: function(){
      console.log('greenhouse is loading');
      var c = Greenhouse.getPath('mainPage.mainPane.container');
      c.set('nowShowing', Greenhouse.getPath('mainPage.loading'));
    },
    exitState: function(){
      
    },
    
    // ..........................................................
    // Events
    //
    /*
      called when the file list call completes
    */
    fileListCallDidComplete: function(){
      //eval all the appropriate files
      this.goState('iframeLoading');
    },

    /*
      called when the file choose call completes
    */
    fetchTargetsDidComplete: function(){
      //eval all the appropriate files
      this.goState('chooseApp');
    }
    
  }),
  
  chooseApp: SC.State.create({
    
    enterState: function(){
      var c = Greenhouse.getPath('mainPage.mainPane.container');
      c.set('nowShowing', Greenhouse.getPath('mainPage.appPicker'));
    },
    exitState: function(){
      
    },
    
    // ..........................................................
    // Events
    //
    loadApplication: function(){
      Greenhouse.filesController.reload();
      Greenhouse.viewConfigsController.reload();
      this.goState('loading');
    }
  }),
  
  iframeLoading: SC.State.create({
    
    enterState: function(){
      var c = Greenhouse.getPath('mainPage.mainPane.container');
      c.set('nowShowing', Greenhouse.getPath('appPage.mainView'));
      //TODO disable views and display a loading spinner
    },
    exitState: function(){
      
    },
    
    // ..........................................................
    // Events
    //
    iframeLoaded: function(){
      this.goState('syncRunLoops');
    }
  }),
  
  syncRunLoops: SC.State.create({
    
    enterState: function(){
      this._setupRunLoops();
      this._grabDropTargets();
      this._setupGreenhouse();
      this._setupEventBlocker();
      this.invokeLater(function(){this.goState('readyWaiting');}); //totally cheating!!
    },
    exitState: function(){
      
    },
    
    // ..........................................................
    // Monkey-Patch Run Loop
    // 
    _setupRunLoops: function(){
      var iframe = Greenhouse.get('iframe'), innerBegin, outerBegin, innerEnd, outerEnd, outerSC = SC;


      outerBegin = outerSC.RunLoop.begin = function() { 
        //console.log('outer begin');
        var runLoop = this.currentRunLoop;
        if (!runLoop) runLoop = this.currentRunLoop = outerSC.RunLoop.runLoopClass.create();
        runLoop.beginRunLoop();

        //begin the iframe's run loop...
        var runLoopIframe = iframe.SC.RunLoop.currentRunLoop;
        if (!runLoopIframe) runLoopIframe = iframe.SC.RunLoop.currentRunLoop = iframe.SC.RunLoop.runLoopClass.create();
        runLoopIframe.beginRunLoop();

        return this ;
      };
      innerBegin = iframe.SC.RunLoop.begin = function() {
        //console.log('inner begin');
        outerBegin(); //inner run loop always triggers both loops
        return this ;
      };

      outerEnd = outerSC.RunLoop.end = function() {
        //end any inner run loops if they exist.
        var innerLoop = iframe.SC.RunLoop.currentRunLoop;
        if(innerLoop) innerLoop.endRunLoop();


        //console.log('outer end');
        var runLoop = this.currentRunLoop;
        if (!runLoop) {
          throw "SC.RunLoop.end() called outside of a runloop!";
        }
        runLoop.endRunLoop();
        return this ;
      };

      innerEnd = iframe.SC.RunLoop.end = function() {
        //console.log('inner end');
        var runLoop = this.currentRunLoop;
        if (!runLoop) {
          throw "SC.RunLoop.end() called outside of a runloop!";
        }
        runLoop.endRunLoop();
        outerEnd();
        return this ;
      };
    },

    _grabDropTargets: function(){
      var iframe = Greenhouse.get('iframe'), 
          innerTargets,
          webViewFrame,
          webView = Greenhouse.appPage.get('webView');

      var pv = webView.get('parentView');
        webViewFrame = webView.get('frame');
      webViewFrame = pv.convertFrameToView(webViewFrame, null);


      //add existing targets
      innerTargets = iframe.SC.Drag._dropTargets;

      for(var dt in innerTargets){
        if(innerTargets.hasOwnProperty(dt)){
          SC.Drag.addDropTarget(innerTargets[dt]);
        }
      }

      //make sure we get any new ones
      iframe.SC.Drag.addDropTarget = function(target) {
        iframe.SC.Drag._dropTargets[iframe.SC.guidFor(target)] = target ;
        SC.Drag._dropTargets[iframe.SC.guidFor(target)] = target ;
      };


      iframe.SC.Drag.removeDropTarget = function(target) {
        delete iframe.SC.Drag._dropTargets[iframe.SC.guidFor(target)] ;
        delete SC.Drag._dropTargets[iframe.SC.guidFor(target)];
      };


      SC.Drag.prototype._findDropTarget = function(evt) {
        var loc = { x: evt.pageX, y: evt.pageY } ;

        var target, frame ;
        var ary = this._dropTargets() ;
        for (var idx=0, len=ary.length; idx<len; idx++) {
          target = ary[idx] ;

          // If the target is not visible, it is not valid.
          if (!target.get('isVisibleInWindow')) continue ;

          // get clippingFrame, converted to the pane.
          frame = target.convertFrameToView(target.get('clippingFrame'), null) ;

          //if this is in the iframe adjust the frame accordingly
          if(target.get('targetIsInIFrame')){
             frame.x = frame.x + webViewFrame.x;
             frame.y = frame.y + webViewFrame.y;
           }
          // check to see if loc is inside.  If so, then make this the drop target
          // unless there is a drop target and the current one is not deeper.
          if (SC.pointInRect(loc, frame)) return target;
        } 
        return null ;
      };
      //all inner drags are actually outer drags
      iframe.SC.Drag.start = SC.Drag.start;
    },

    _setupGreenhouse: function(){
      var iframe = Greenhouse.get('iframe');
      iframe.SC._Greenhouse = Greenhouse;
    },
    
    _setupEventBlocker: function(){
      var eventBlocker = Greenhouse.appPage.get('eventBlocker');
      Greenhouse.set('eventBlocker', eventBlocker);
    }
  })
});

