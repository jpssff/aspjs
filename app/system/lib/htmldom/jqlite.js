/*!
 * jQuery "lite"
 *
 * jqlite is a striped-down version of jQuery modified to work with a server-side document
 * object model. This library makes manipulating HTML documents convenient and familiar.
 *
 * Depends on htmlparser, xmldom, domwrapper, and sizzle
 *
 */

if (!this.lib_jqlite) this.lib_jqlite = lib_jqlite;
function lib_jqlite() {

  /*!
   * jQuery JavaScript Library (based on v1.4.2)
   *
   * Copyright 2010, John Resig
   * Dual licensed under the MIT or GPL Version 2 licenses.
   * http://jquery.org/license
   *
   */
  function instantiate(document) {

    function jQuery(selector, context) {
      return new jQuery.fn.init(selector, context);
    }

    //Sizzle Selector Engine
    var Sizzle = jQuery.find = lib('sizzle');
    jQuery.expr = Sizzle.selectors;
    jQuery.expr[':'] = jQuery.expr.filters;
    jQuery.unique = Sizzle.uniqueSort;
    jQuery.contains = Sizzle.contains;

    var rootjQuery //jQuery(document)
      , undefined
        // A simple way to check for HTML strings or ID strings
      , quickExpr = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/
        // Is it a simple selector
      , isSimple = /^.[^:#\[\.,]*$/
        // Does string contain HTML
      , rhtml = /<|&#?\w+;/
        // Used for trimming whitespace
      , rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g
        // Match a standalone tag
      , rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/
        // Save a reference to some core methods
      , toString = Object.prototype.toString
      , hasOwnProperty = Object.prototype.hasOwnProperty
      , push = Array.prototype.push
      , slice = Array.prototype.slice
      , rspace = /\s+/
      , rradiocheck = /radio|checkbox/
      , runtil = /Until$/
      , rparentsprev = /^(?:parents|prevUntil|prevAll)/
        // Note: This RegExp should be improved, or likely pulled from Sizzle
      , rmultiselector = /,/;


    jQuery.fn = jQuery.prototype = {
      init: function(selector, context) {
        var match, elem, ret, doc;

        // Handle $(''), $(null), or $(undefined)
        if (!selector) {
          return this;
        }

        // Handle $(DOMElement)
        if (selector.nodeType) {
          this.context = this[0] = selector;
          this.length = 1;
          return this;
        }

        // Handle HTML strings
        if (typeof selector == 'string') {
          // Are we dealing with HTML string or an ID?
          match = quickExpr.exec(selector);

          // Verify a match, and that no context was specified for #id
          if (match && (match[1] || !context)) {

            // HANDLE: $(html) -> $(array)
            if (match[1]) {
              doc = (context && context.ownerDocument) ? (context.ownerDocument() || context) : document;

              // If a single string is passed in and it's a single tag just do a createElement
              ret = rsingleTag.exec(selector);

              if (ret) {
                if (jQuery.isPlainObject(context)) {
                  selector = [document.createElement(ret[1])];
                  jQuery.fn.attr.call(selector, context, true);
                } else {
                  selector = [doc.createElement(ret[1])];
                }
              } else {
                ret = buildFragment([match[1]], [doc]);
                selector = ret.childNodes();
              }

              return jQuery.merge(this, selector);

              // HANDLE: $('#id')
            } else {
              elem = document.getElementById(match[2]);

              if (elem) {
                // Handle the case where IE and Opera return items
                // by name instead of ID
                if (elem.id !== match[2]) {
                  return rootjQuery.find(selector);
                }

                // Otherwise, we inject the element directly into the jQuery object
                this.length = 1;
                this[0] = elem;
              }

              this.context = document;
              this.selector = selector;
              return this;
            }

          } else
          // HANDLE: $('TAG')
          if (!context && /^\w+$/.test(selector)) {
            this.selector = selector;
            this.context = document;
            selector = document.getElementsByTagName(selector);
            return jQuery.merge(this, selector);

          } else
          // HANDLE: $(expr, $(...))
          if (!context || context.jquery) {
            return (context || rootjQuery).find(selector);

            // HANDLE: $(expr, context) which is just equivalent to: $(context).find(expr)
          } else {
            return jQuery(context).find(selector);
          }

        }

        if (selector.selector !== undefined) {
          this.selector = selector.selector;
          this.context = selector.context;
        }

        return jQuery.makeArray(selector, this);
      },

      // Start with an empty selector
      selector: '',

      // The current version of jQuery being used
      jquery: '1.4.2',

      // The default length of a jQuery object is 0
      length: 0,

      // The number of elements contained in the matched element set
      size: function() {
        return this.length;
      },

      toArray: function() {
        return slice.call(this, 0);
      },

      // Get the Nth element in the matched element set OR
      // Get the whole matched element set as a clean array
      get: function(num) {
        return num == null ?

        // Return a 'clean' array
        this.toArray() :

        // Return just the object
        (num < 0 ? this.slice(num)[0] : this[num]);
      },

      // Take an array of elements and push it onto the stack
      // (returning the new matched element set)
      pushStack: function(elems, name, selector) {
        // Build a new jQuery matched element set
        var ret = jQuery();

        if (jQuery.isArray(elems)) {
          push.apply(ret, elems);

        } else {
          jQuery.merge(ret, elems);
        }

        // Add the old object onto the stack (as a reference)
        ret.prevObject = this;

        ret.context = this.context;

        if (name === 'find') {
          ret.selector = this.selector + (this.selector ? ' ' : '') + selector;
        } else
        if (name) {
          ret.selector = this.selector + '.' + name + '(' + selector + ')';
        }

        // Return the newly-formed element set
        return ret;
      },

      // Execute a callback for every element in the matched set.
      // (You can seed the arguments with an array of args, but this is
      // only used internally.)
      each: function(callback, args) {
        return jQuery.each(this, callback, args);
      },

      eq: function(i) {
        return i === -1 ? this.slice(i) : this.slice(i, +i + 1);
      },

      first: function() {
        return this.eq(0);
      },

      last: function() {
        return this.eq(-1);
      },

      slice: function() {
        return this.pushStack(slice.apply(this, arguments), 'slice', slice.call(arguments).join(','));
      },

      map: function(callback) {
        return this.pushStack(jQuery.map(this, function(elem, i) {
          return callback.call(elem, i, elem);
        }));
      },

      end: function() {
        return this.prevObject || jQuery(null);
      },

      // For internal use only.
      // Behaves like an Array's method, not like a jQuery method.
      push: push,
      sort: [].sort,
      splice: [].splice
    };

    // Give the init function the jQuery prototype for later instantiation
    jQuery.fn.init.prototype = jQuery.fn;

    jQuery.extend = jQuery.fn.extend = function() {
      // copy reference to target object
      var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

      // Handle a deep copy situation
      if (typeof target == 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== 'object' && !jQuery.isFunction(target)) {
        target = {};
      }

      // extend jQuery itself if only one argument is passed
      if (length === i) {
        target = this;
        --i;
      }

      for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
          // Extend the base object
          for (name in options) {
            src = target[name];
            copy = options[name];

            // Prevent never-ending loop
            if (target === copy) {
              continue;
            }

            // Recurse if we're merging object literal values or arrays
            if (deep && copy && (jQuery.isPlainObject(copy) || jQuery.isArray(copy))) {
              var clone = src && (jQuery.isPlainObject(src) || jQuery.isArray(src)) ? src : jQuery.isArray(copy) ? [] : {};

              // Never move original objects, clone them
              target[name] = jQuery.extend(deep, clone, copy);

              // Don't bring in undefined values
            } else
            if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }

      // Return the modified object
      return target;
    };

    jQuery.extend({
      isFunction: function(obj) {
        return toString.call(obj) == '[object Function]';
      },

      isArray: function(obj) {
        return toString.call(obj) == '[object Array]';
      },

      isPlainObject: function(obj) {
        if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType) {
          return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for (key in obj) {}

        return key === undefined || hasOwnProperty.call(obj, key);
      },

      isEmptyObject: function(obj) {
        for (var name in obj) {
          return false;
        }
        return true;
      },

      error: function(msg) {
        throw msg;
      },

      noop: function() {},

      nodeName: function(elem, name) {
        return elem.nodeName && elem.nodeName().toUpperCase() == name.toUpperCase();
      },

      // args is for internal usage only
      each: function(object, callback, args) {
        var name, i = 0, length = object.length, isObj = length === undefined || jQuery.isFunction(object);

        if (args) {
          if (isObj) {
            for (name in object) {
              if (callback.apply(object[name], args) === false) {
                break;
              }
            }
          } else {
            for (; i < length;) {
              if (callback.apply(object[i++], args) === false) {
                break;
              }
            }
          }

          // A special, fast, case for the most common use of each
        } else {
          if (isObj) {
            for (name in object) {
              if (callback.call(object[name], name, object[name]) === false) {
                break;
              }
            }
          } else {
            for (var value = object[0];
            i < length && callback.call(value, i, value) !== false; value = object[++i]) {}
          }
        }

        return object;
      },

      trim: function(text) {
        return (text || '').replace(rtrim, '');
      },

      // results is for internal usage only
      makeArray: function(array, results) {
        var ret = results || [];

        if (array != null) {
          // The window, strings (and functions) also have 'length'
          if (array.length == null || typeof array == 'string' || jQuery.isFunction(array)) {
            push.call(ret, array);
          } else {
            jQuery.merge(ret, array);
          }
        }

        return ret;
      },

      inArray: function(elem, array) {
        var pos = -1;
        if (Array.prototype.indexOf) {
          pos = Array.prototype.indexOf.call(array, elem);
        } else {
          throw new Error('No Array.prototype.indexOf');
        }
        if (pos < 0 && elem instanceof Object && elem.equals instanceof Function) {
          for (var i = 0, len = array.length; i < len; i++) {
            if (elem.equals(array[i])) return i;
          }
        }
        return pos;
      },

      merge: function(first, second) {
        var i = first.length, j = 0;

        if (typeof second.length == 'number') {
          for (var l = second.length; j < l; j++) {
            first[i++] = second[j];
          }
        } else {
          while (second[j] !== undefined) {
            first[i++] = second[j++];
          }
        }

        first.length = i;

        return first;
      },

      grep: function(elems, callback, inv) {
        var ret = [];

        // Go through the array, only saving the items
        // that pass the validator function
        for (var i = 0, length = elems.length; i < length; i++) {
          if (!inv !== !callback(elems[i], i)) {
            ret.push(elems[i]);
          }
        }

        return ret;
      },

      // arg is for internal usage only
      map: function(elems, callback, arg) {
        var ret = [], value;

        // Go through the array, translating each of the items to their
        // new value (or values).
        for (var i = 0, length = elems.length; i < length; i++) {
          value = callback(elems[i], i, arg);

          if (value != null) {
            ret[ret.length] = value;
          }
        }

        return ret.concat.apply([], ret);
      }

    });


    // All jQuery objects should point back to these
    rootjQuery = jQuery(document);

    jQuery.toHTML = function() {
      return rootjQuery.html();
    };

    // Mutifunctional method to get and set values to a collection
    // The value/s can be optionally by executed if its a function


    function access(elems, key, value, exec, fn, pass) {
      var length = elems.length;

      // Setting many attributes
      if (typeof key == 'object') {
        for (var k in key) {
          access(elems, k, key[k], exec, fn, value);
        }
        return elems;
      }

      // Setting one attribute
      if (value !== undefined) {
        // Optionally, function values get executed if exec is true
        exec = !pass && exec && jQuery.isFunction(value);

        for (var i = 0; i < length; i++) {
          fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
        }

        return elems;
      }

      // Getting an attribute
      return length ? fn(elems[0], key) : undefined;
    }

    function now() {
      return (new Date).getTime();
    }

    //JQUERY ATTRIBUTES
    jQuery.fn.extend({
      attr: function(name, value) {
        return access(this, name, value, true, jQuery.attr);
      },

      removeAttr: function(name, fn) {
        return this.each(function() {
          jQuery.attr(this, name, '');
          if (this.nodeType() == 1) {
            this.removeAttribute(name);
          }
        });
      },

      addClass: function(value) {
        if (jQuery.isFunction(value)) {
          return this.each(function(i) {
            var self = jQuery(this);
            self.addClass(value.call(this, i, self.attr('class')));
          });
        }

        if (value && typeof value == 'string') {
          var classNames = (value || '').split(rspace);
          for (var i = 0, l = this.length; i < l; i++) {
            var elem = this[i];
            if (elem.nodeType() == 1) {
              if (!elem.getAttribute('class')) {
                elem.setAttribute('class', value);
              } else {
                var className = ' ' + elem.getAttribute('class') + ' ', setClass = elem.getAttribute('class');
                for (var c = 0, cl = classNames.length; c < cl; c++) {
                  if (className.indexOf(' ' + classNames[c] + ' ') < 0) {
                    setClass += ' ' + classNames[c];
                  }
                }

                elem.setAttribute('class', jQuery.trim(setClass));
              }
            }
          }
        }

        return this;
      },

      removeClass: function(value) {
        if (jQuery.isFunction(value)) {
          return this.each(function(i) {
            var self = jQuery(this);
            self.removeClass(value.call(this, i, self.attr('class')));
          });
        }

        if ((value && typeof value == 'string') || value === undefined) {
          var classNames = (value || '').split(rspace);
          for (var i = 0, l = this.length; i < l; i++) {
            var elem = this[i];
            if (elem.nodeType() == 1 && elem.getAttribute('class')) {
              if (value) {
                var className = (' ' + elem.getAttribute('class') + ' ');
                for (var c = 0, cl = classNames.length; c < cl; c++) {
                  className = className.replace(' ' + classNames[c] + ' ', ' ');
                }
                elem.setAttribute('class', jQuery.trim(className));
              } else {
                elem.setAttribute('class', '');
              }
            }
          }
        }

        return this;
      },

      toggleClass: function(value, stateVal) {
        var type = typeof value, isBool = typeof stateVal == 'boolean';

        if (jQuery.isFunction(value)) {
          return this.each(function(i) {
            var self = jQuery(this);
            self.toggleClass(value.call(this, i, self.attr('class'), stateVal), stateVal);
          });
        }

        return this.each(function() {
          if (type == 'string') {
            // toggle individual class names
            var className, i = 0, self = jQuery(this), state = stateVal, classNames = value.split(rspace);

            while ((className = classNames[i++])) {
              // check each className given, space separated list
              state = isBool ? state : !self.hasClass(className);
              self[state ? 'addClass' : 'removeClass'](className);
            }

          } else
          if (type == 'undefined' || type == 'boolean') {
            if (this.getAttribute('class')) {
              // store className if set
              this.setAttribute('__class__', this.getAttribute('class'));
            }

            // toggle whole className
            this.setAttribute('class', this.getAttribute('class') || value === false ? '' : this.getAttribute('__class__') || '')
          }
        });
      },

      hasClass: function(selector) {
        var className = ' ' + selector + ' ';
        for (var i = 0, l = this.length; i < l; i++) {
          if ((' ' + this[i].getAttribute('class') + ' ').indexOf(className) > -1) {
            return true;
          }
        }

        return false;
      },

      val: function(value) {
        if (value === undefined) {
          var elem = this[0];

          if (elem) {
            if (jQuery.nodeName(elem, 'option')) {
              return elem.hasAttribute('value') ? elem.getAttribute('value') || '' : jQuery(elem).text();
            }

            // Select Boxes
            if (jQuery.nodeName(elem, 'select')) {
              var opts = jQuery('option:selected', elem);
              if (!elem.hasAttribute('multiple') || opts.length == 1) {
                return jQuery(opts).val()
              }
              if (opts.length > 1) {
                return opts.map(function(el) {
                  return jQuery(el).val();
                });
              }
            }

            //TODO: Check Boxes / Radio Options

            // Everything else, we just grab the value
            return elem.getAttribute('value') || '';

          }

          return undefined;
        }

        var isFunction = jQuery.isFunction(value);

        return this.each(function(i) {
          var self = jQuery(this), val = value;
          if (this.nodeType() !== 1) {
            return;
          }
          if (isFunction) {
            val = value.call(this, i, self.val());
          }
          if (typeof val == 'number') {
            val += '';
          }
          if (jQuery.isArray(val) && rradiocheck.test(this.getAttribute('type'))) {
            if (jQuery.inArray(self.val(), val)) {
              this.setAttribute('checked', 'checked');
            } else {
              this.removeAttribute('checked');
            }
          } else
          if (jQuery.nodeName(this, 'select')) {
            var values = jQuery.makeArray(val);
            jQuery('option', this).each(function() {
              if (jQuery.inArray(jQuery(this).val(), values)) {
                this.setAttribute('selected', 'selected');
              } else {
                this.removeAttribute('selected');
              }
            });
          } else {
            this.setAttribute('value', val);
          }
        });
      }
    });

    jQuery.extend({
      attrFn: {
        val: true,
        html: true,
        text: true
      },

      attr: function(elem, name, value, pass) {
        // don't set attributes on text and comment nodes
        if (!elem || elem.nodeType() == 3 || elem.nodeType() == 8) {
          return undefined;
        }

        if (pass && name in jQuery.attrFn) {
          return jQuery(elem)[name](value);
        }

        var set = value !== undefined;

        // Only do all the following if this is a node
        if (elem.nodeType() == 1) {
          if (set) {
            elem.setAttribute(name, '' + value);
          }
          var attr = elem.getAttribute(name);
          // Non-existent attributes return null, we normalize to undefined
          return attr === null ? undefined : attr;
        }

      }
    });

    //JQUERY TRAVERSING
    // Implement the identical functionality for filter and not
    function winnow(elements, qualifier, keep) {
      if (jQuery.isFunction(qualifier)) {
        return jQuery.grep(elements, function(elem, i) {
          return !!qualifier.call(elem, i, elem) === keep;
        });
      } else
      if (qualifier.nodeType) {
        return jQuery.grep(elements, function(elem, i) {
          return (elem.equals(qualifier)) === keep;
        });
      } else
      if (typeof qualifier == 'string') {
        var filtered = jQuery.grep(elements, function(elem) {
          return elem.nodeType() == 1;
        });
        if (isSimple.test(qualifier)) {
          return jQuery.filter(qualifier, filtered, !keep);
        } else {
          qualifier = jQuery.filter(qualifier, filtered);
        }
      }
      return jQuery.grep(elements, function(elem, i) {
        return (jQuery.inArray(elem, qualifier) >= 0) === keep;
      });
    }

    jQuery.fn.extend({
      find: function(selector) {
        var ret = this.pushStack('', 'find', selector), length = 0;

        for (var i = 0, l = this.length; i < l; i++) {
          length = ret.length;
          jQuery.find(selector, this[i], ret);

          if (i > 0) {
            // Make sure that the results are unique
            for (var n = length; n < ret.length; n++) {
              for (var r = 0; r < length; r++) {
                if (ret[r].equals(ret[n])) {
                  ret.splice(n--, 1);
                  break;
                }
              }
            }
          }
        }

        return ret;
      },

      has: function(target) {
        var targets = jQuery(target);
        return this.filter(function() {
          for (var i = 0, l = targets.length; i < l; i++) {
            if (jQuery.contains(this, targets[i])) {
              return true;
            }
          }
        });
      },

      not: function(selector) {
        return this.pushStack(winnow(this, selector, false), 'not', selector);
      },

      filter: function(selector) {
        return this.pushStack(winnow(this, selector, true), 'filter', selector);
      },

      is: function(selector) {
        return !!selector && jQuery.filter(selector, this).length > 0;
      },

      closest: function(selectors, context) {
        if (jQuery.isArray(selectors)) {
          var ret = [], cur = this[0], match, matches = {}, selector;
          if (cur && selectors.length) {
            for (var i = 0, l = selectors.length; i < l; i++) {
              selector = selectors[i];
              if (!matches[selector]) {
                matches[selector] = jQuery.expr.match.POS.test(selector) ? jQuery(selector, context || this.context) : selector;
              }
            }
            while (cur && cur.ownerDocument() && !cur.equals(context)) {
              for (selector in matches) {
                match = matches[selector];
                if (match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match)) {
                  ret.push({
                    selector: selector,
                    elem: cur
                  });
                  delete matches[selector];
                }
              }
              cur = cur.parentNode();
            }
          }
          return ret;
        }

        var pos = jQuery.expr.match.POS.test(selectors) ? jQuery(selectors, context || this.context) : null;

        return this.map(function(i, cur) {
          while (cur && cur.ownerDocument() && !cur.equals(context)) {
            if (pos ? pos.index(cur) > -1 : jQuery(cur).is(selectors)) {
              return cur;
            }
            cur = cur.parentNode();
          }
          return null;
        });
      },

      // Determine the position of an element within
      // the matched set of elements
      index: function(elem) {
        if (!elem || typeof elem == 'string') {
          return jQuery.inArray(this[0],
          // If it receives a string, the selector is used
          // If it receives nothing, the siblings are used
          elem ? jQuery(elem) : this.parent().children());
        }
        // Locate the position of the desired element
        return jQuery.inArray(
        // If it receives a jQuery object, the first element is used
        elem.jquery ? elem[0] : elem, this);
      },

      add: function(selector, context) {
        var set = typeof selector == 'string' ? jQuery(selector, context || this.context) : jQuery.makeArray(selector)
          , all = jQuery.merge(this.get(), set);

        return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ? all : jQuery.unique(all));
      },

      andSelf: function() {
        return this.add(this.prevObject);
      }
    });

    // A painfully simple check to see if an element is disconnected
    // from a document (should be improved, where feasible).


    function isDisconnected(node) {
      return !node || !node.parentNode() || node.parentNode().nodeType() == 11;
    }

    jQuery.each({
      parent: function(elem) {
        var parent = elem.parentNode();
        return parent && parent.nodeType() !== 11 ? parent : null;
      },
      parents: function(elem) {
        return jQuery.dir(elem, 'parentNode');
      },
      parentsUntil: function(elem, i, until) {
        return jQuery.dir(elem, 'parentNode', until);
      },
      next: function(elem) {
        return jQuery.nth(elem, 2, 'nextSibling');
      },
      prev: function(elem) {
        return jQuery.nth(elem, 2, 'previousSibling');
      },
      nextAll: function(elem) {
        return jQuery.dir(elem, 'nextSibling');
      },
      prevAll: function(elem) {
        return jQuery.dir(elem, 'previousSibling');
      },
      nextUntil: function(elem, i, until) {
        return jQuery.dir(elem, 'nextSibling', until);
      },
      prevUntil: function(elem, i, until) {
        return jQuery.dir(elem, 'previousSibling', until);
      },
      siblings: function(elem) {
        return jQuery.sibling(elem.parentNode().firstChild(), elem);
      },
      children: function(elem) {
        return jQuery.sibling(elem.firstChild());
      },
      contents: function(elem) {
        return jQuery.makeArray(elem.childNodes());
      }
    }, function(name, fn) {
      jQuery.fn[name] = function(until, selector) {
        var ret = jQuery.map(this, fn, until);

        if (!runtil.test(name)) {
          selector = until;
        }

        if (selector && typeof selector == 'string') {
          ret = jQuery.filter(selector, ret);
        }

        ret = this.length > 1 ? jQuery.unique(ret) : ret;

        if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name)) {
          ret = ret.reverse();
        }

        return this.pushStack(ret, name, slice.call(arguments).join(','));
      };
    });

    jQuery.extend({
      filter: function(expr, elems, not) {
        if (not) {
          expr = ':not(' + expr + ')';
        }

        return jQuery.find.matches(expr, elems);
      },

      dir: function(elem, dir, until) {
        var matched = [], cur = elem[dir]();
        while (cur && cur.nodeType() !== 9 && (until === undefined || cur.nodeType() !== 1 || !jQuery(cur).is(until))) {
          if (cur.nodeType() == 1) {
            matched.push(cur);
          }
          cur = cur[dir]();
        }
        return matched;
      },

      nth: function(cur, result, dir, elem) {
        result = result || 1;
        var num = 0;

        for (; cur; cur = cur[dir]()) {
          if (cur.nodeType() == 1 && ++num === result) {
            break;
          }
        }

        return cur;
      },

      sibling: function(n, elem) {
        var r = [];

        for (; n; n = n.nextSibling()) {
          if (n.nodeType() == 1 && !n.equals(elem)) {
            r.push(n);
          }
        }

        return r;
      }
    });

    //JQUERY MANIPULATION
    jQuery.fn.extend({
      text: function(text) {
        if (jQuery.isFunction(text)) {
          return this.each(function(i) {
            var self = jQuery(this);
            self.text(text.call(this, i, self.text()));
          });
        }

        if (typeof text !== 'object' && text !== undefined) {
          return this.empty().append((this[0] && this[0].ownerDocument && this[0].ownerDocument() || document).createTextNode(text));
        }

        return Sizzle.getText(this);
      },

      wrapAll: function(html) {
        if (jQuery.isFunction(html)) {
          return this.each(function(i) {
            jQuery(this).wrapAll(html.call(this, i));
          });
        }

        if (this[0]) {
          // The element(s) to wrap the target with
          var wrap = jQuery(html, this[0].ownerDocument()).eq(0).clone(true);

          if (this[0].parentNode()) {
            wrap.insertBefore(this[0]);
            //Added 2011/06/03 (not sure where the child is *supposed* to be removed)
            //this[0].parentNode().removeChild(this[0]);
          }

          wrap = wrap.map(function() {
            var elem = this;
            while (elem.firstChild() && elem.firstChild().nodeType() == 1) {
              elem = elem.firstChild();
            }
            return elem;
          });
          wrap.append(this);
        }

        return this;
      },

      wrapInner: function(html) {
        if (jQuery.isFunction(html)) {
          return this.each(function(i) {
            jQuery(this).wrapInner(html.call(this, i));
          });
        }
        return this.each(function() {
          var self = jQuery(this), contents = self.contents();
          if (contents.length) {
            contents.wrapAll(html);
          } else {
            self.append(html);
          }
        });
      },

      wrap: function(html) {
        return this.each(function() {
          jQuery(this).wrapAll(html);
        });
      },

      unwrap: function() {
        return this.parent().each(function() {
          if (!jQuery.nodeName(this, 'body')) {
            jQuery(this).replaceWith(this.childNodes());
          }
        }).end();
      },

      append: function() {
        //! parent: this, children: arguments[0] (set) + arguments[1] ...
        return this.domManip(arguments, true, function(elem) {
          if (this.nodeType() == 1) {
            this.appendChild(elem);
          }
        });
      },

      prepend: function() {
        return this.domManip(arguments, true, function(elem) {
          if (this.nodeType() == 1) {
            this.insertBefore(elem, this.firstChild());
          }
        });
      },

      before: function() {
        if (this[0] && this[0].parentNode()) {
          return this.domManip(arguments, false, function(elem) {
            this.parentNode().insertBefore(elem, this);
          });
        } else
        if (arguments.length) {
          var set = jQuery(arguments[0]);
          set.push.apply(set, this.toArray());
          return this.pushStack(set, 'before', arguments);
        }
      },

      after: function() {
        if (this[0] && this[0].parentNode()) {
          return this.domManip(arguments, false, function(elem) {
            this.parentNode().insertBefore(elem, this.nextSibling());
          });
        } else
        if (arguments.length) {
          var set = this.pushStack(this, 'after', arguments);
          set.push.apply(set, jQuery(arguments[0]).toArray());
          return set;
        }
      },

      remove: function(selector) {
        for (var i = 0, elem; (elem = this[i]) != null; i++) {
          if (!selector || jQuery.filter(selector, [elem]).length) {
            if (elem.parentNode()) {
              elem.parentNode().removeChild(elem);
            }
          }
        }

        return this;
      },

      empty: function() {
        for (var i = 0, elem;
        (elem = this[i]) != null; i++) {
          // Remove any remaining nodes
          while (elem.firstChild()) {
            elem.removeChild(elem.firstChild());
          }
        }

        return this;
      },

      clone: function() {
        var ret = this.map(function() {
          return this.cloneNode(true);
        });
        return ret;
      },

      html: function(value) {
        if (value === undefined) {
          if (this[0]) {
            if (this[0].nodeType() == 9) {
              return this[0].outerHTML();
            } else
            if (this[0].nodeType() == 1) {
              return this[0].innerHTML();
            }
          }
          return null;
        } else
        if (jQuery.isFunction(value)) {
          this.each(function(i) {
            var self = jQuery(this), old = self.html();
            self.empty().append(function() {
              return value.call(this, i, old);
            });
          });

        } else {
          this.empty().append(value);
        }

        return this;
      },

      toHTML: function() {
        var html = [];
        this.each(function() {
          html.push(this.outerHTML());
        });
        return html.length ? html.join('\r\n') : null;
      },

      replaceWith: function(value) {
        if (this[0] && this[0].parentNode()) {
          // Make sure that the elements are removed from the DOM before they are inserted
          // this can help fix replacing a parent with child elements
          if (jQuery.isFunction(value)) {
            return this.each(function(i) {
              var self = jQuery(this), old = self.html();
              self.replaceWith(value.call(this, i, old));
            });
          }

          if (typeof value !== 'string') {
            value = jQuery(value).detach();
          }

          return this.each(function() {
            var next = this.nextSibling(), parent = this.parentNode();
            jQuery(this).remove();
            if (next) {
              jQuery(next).before(value);
            } else {
              jQuery(parent).append(value);
            }
          });
        } else {
          return this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), 'replaceWith', value);
        }
      },

      detach: function(selector) {
        return this.remove(selector, true);
      },

      domManip: function(args, table, callback) {
        var first, value = args[0];

        if (jQuery.isFunction(value)) {
          return this.each(function(i) {
            var self = jQuery(this);
            args[0] = value.call(this, i, table ? self.html() : undefined);
            self.domManip(args, table, callback);
          });
        }

        //$(label) = value = args[0]
        if (this[0]) {
          var parent = value && value.parentNode && value.parentNode(), fragment;
          // If we're in a fragment, just use that instead of building a new one
          if (parent && parent.nodeType() == 11 && parent.childNodes().length === this.length) {
            fragment = parent;
          } else {
            fragment = buildFragment(args, this);
          }
          if (fragment.childNodes().length == 1) {
            first = fragment = fragment.firstChild();
          } else {
            first = fragment.firstChild();
          }
          if (first) {
            for (var i = 0, l = this.length; i < l; i++) {
              callback.call(this[i], (i > 0 || this.length > 1) ? fragment.cloneNode(true) : fragment);
            }
          }
        }

        return this;
      }
    });

    function buildFragment(args, nodes) {
      var doc = (nodes && nodes[0] ? nodes[0].ownerDocument() || nodes[0] : document)
        , fragment = doc.createDocumentFragment()
        , elems = [];

      for (var i = 0, elem; (elem = args[i]) != null; i++) {
        if (typeof elem == 'number') {
          elem = '' + elem;
        }
        if (!elem) {
          continue;
        }
        if (typeof elem == 'string' && !rhtml.test(elem)) {
          elem = doc.createTextNode(elem);
        } else
        if (typeof elem == 'string') {
          var frag = doc.createDocumentFragment();
          frag.appendHTML(elem);
          elem = frag.childNodes();
        }
        if (elem.nodeType) {
          elems.push(elem);
        } else {
          elems = jQuery.merge(elems, elem);
        }
      }
      for (var i = 0; elems[i]; i++) {
        fragment.appendChild(elems[i]);
      }

      return fragment;
    }

    jQuery.each({
      appendTo: 'append',
      prependTo: 'prepend',
      insertBefore: 'before',
      insertAfter: 'after',
      replaceAll: 'replaceWith'
    }, function(name, original) {
      jQuery.fn[name] = function(selector) {
        var ret = [], insert = jQuery(selector), parent = this.length == 1 && this[0].parentNode();

        if (parent && parent.nodeType() == 11 && parent.childNodes().length == 1 && insert.length == 1) {
          insert[original](this[0]);
          return this;

        } else {
          for (var i = 0, l = insert.length; i < l; i++) {
            var elems = (i > 0 ? this.clone(true) : this).get();
            jQuery.fn[original].apply(jQuery(insert[i]), elems);
            ret = ret.concat(elems);
          }

          return this.pushStack(ret, name, insert.selector);
        }
      };
    });

    return jQuery;

  }

  return {
    create: function(html) {
      var dom = lib('domwrapper')
        , doc = new dom.HtmlDoc(html)
        , jQuery = instantiate(doc);
      jQuery._doc = doc;
      return jQuery;
    }
  };

}
