function lib_jqlite() {

  var domwrapper = lib('domwrapper'), sizzle = lib('sizzle');

  function WrappedSet(arr) {
    var obj = {};
    arr.each(function(i, el) {
      obj[el.getPath()] = el;
    });
    this._map = obj;
    this.items = Object.values(obj);
  }
  WrappedSet.prototype = {
    each: function(fn) {
      forEach(this.items, function(i, el) {
        return fn.call(el, i, el);
      });
    },
    append: function(content) {
      if (vartype(content) == 'string' && content.match(/^\s*</)) {
        this.each(function(i, el) {
          el.appendHTML(content);
        });
      } else
      if (content instanceof WrappedSet) {
        this.each(function(i, parent) {
          content.each(function(i, child) {
            //TODO: create appendNode method on domwrapper
            parent.appendHTML(child.outerHTML());
          });
        });
      } else
      if (domwrapper.isHtmlNode(content)) {
        this.each(function(i, el) {
          el.appendHTML(content.outerHTML());
        });
      }
      return this;
    },
    /*!
     * Tree Traversal Methods
     */
    parent: function() {
      var arr = [];
      this.each(function(i, el) {
        arr.push(el.parentNode());
      });
      return new WrappedSet(arr);
    },
    find: function(expr) {
      var arr = sizzle.matches(expr, this.items);
      this.each(function(i, el) {
        arr.concat(sizzle(expr, el));
      });
      return new WrappedSet(arr);
    },
    /*!
     * Misc Traversal Methods
     */
    add: function(data) {
      var self = this, type = vartype(data);
      if (type == 'array' || data.items) {
        var items = data.items || data;
        items.each(function(i, el) {
          self.add(el);
        });
        return this;
      } else
      if (domwrapper.isHtmlNode(data)) {
        var path = data.getPath();
        this._map[path] = data;
        this.items = Object.values(this._map);
        return this;
      } else
      if (type == 'string') {
        //TODO: add elements based on selector
      }
    },
    contents: function() {
      var arr = [];
      this.each(function(i, el) {
        arr.concat(el.childNodes());
      });
      return new WrappedSet(arr);
    },
    /*!
     * Class Attribute Methods
     */
    addClass: function(className) {
      this.each(function(i, el) {
        var classList = el.getAttribute('class') || '';
        classList = classList.trim();
        if (classList.toLowerCase().split(/\s+/).indexOf(className.toLowerCase()) < 0) {
          classList = classList + ' ' + className;
        }
        el.setAttribute('class', classList.trim());
      });
      return this;
    },
    hasClass: function(className) {
      var result = false;
      this.each(function(i, el) {
        var classList = el.getAttribute('class') || '';
        classList = classList.trim();
        if (classList.toLowerCase().split(/\s+/).indexOf(className.toLowerCase()) < 0) {
          result = true;
          return false;
        }
      });
      return result;
    },
    removeClass: function(className) {
      this.each(function(i, el) {
        var classList = el.getAttribute('class') || '';
        classList = classList.trim().split(/\s+/);
        var newList = classList.filter(function(str) {
          return (str.toLowerCase() != className.toLowerCase());
        });
        el.setAttribute('class', newList.join(' '));
      });
      return this;
    },
    toggleClass: function(className) {
      this.each(function(i, el) {
        var classList = (el.getAttribute('class') || '').trim();
        if (classList.toLowerCase().split(/\s+/).indexOf(className.toLowerCase()) >= 0) {
          classList = classList.split(/\s+/);
          classList = classList.filter(function(str) {
            return (str.toLowerCase() != className.toLowerCase());
          }).join(' ');
        } else {
          classList = (classList + ' ' + className).trim();
        }
        el.setAttribute('class', newList);
      });
      return this;
    },
    /*!
     * Miscellaneous / DOM Methods
     */
    size: function() {
      return this.items.length;
    },
    get: function(i) {
      return this.items[i];
    },
    toArray: function() {
      return this.items.slice(0);
    },
    toHTML: function() {
      var html = [];
      this.each(function(i, el) {
        html.push(el.outerHTML());
      });
      return html.join('');
    }
  };

  function jqLite() {
    function self(expr, context) {
      return self.find(expr, context);
    }
    self._instance = this;
    Object.append(self, jqLite.prototype);
    return self;
  }
  jqLite.prototype = {
    find: function(expr, context) {
      context = context || this.doc;
      if (!context) {
        throw new Error('No context specified and no default document');
      }
      return this.wrap(sizzle(expr, context));
    },
    wrap: function(items) {
      return new WrappedSet(items);
    },
    toHTML: function() {
      return this.doc.outerHTML();
    }
  };

  return {
    create: function(html) {
      var inst = new jqLite();
      inst.doc = new domwrapper.HtmlDoc(html);
      return inst;
    }
  }

}
