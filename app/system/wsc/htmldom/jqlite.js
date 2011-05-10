function lib_jqlite() {

  var domwrapper = lib('domwrapper');
  var sizzle = lib('sizzle');

  function WrappedSet(arr) {
    this.items = arr || [];
  }
  WrappedSet.prototype = {
    each: function(fn) {
      forEach(this.items, fn);
    },
    append: function(html) {
      this.each(function(i, el) {
        //htmlparser.HTMLtoXML();
        el.appendHTML(html);
      });
      return this;
    },
    addClass: function(className) {
      this.each(function(i, el) {
        var classList = el.getAttribute('class') || '';
        classList = classList.trim();
        if (classList.toLowerCase().split(/\s+/).indexOf(className.toLowerCase()) >= 0) {
          classList = classList + ' ' + className;
        }
        el.setAttribute('class', classList);
      });
      return this;
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
    toString: function() {
      return this.doc.outerHTML();
    }
  };

  return {
    create: function(html) {
      var inst = new jqLite();
      inst.doc = new domwrapper.htmlDoc(html);
      return inst;
    }
  }

}
