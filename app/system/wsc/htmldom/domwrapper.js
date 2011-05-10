function lib_domwrapper() {

  var htmlparser = lib('htmlparser');

  function getTagPosition(node) {
    if (!node.tagName) return '';
    var tagName = node.tagName.toLowerCase(), i = 0;
    while (node = node.previousSibling) {
      if (tagName == node.tagName.toLowerCase()) i++;
    }
    return tagName + '[' + i + ']';
  }

  function HtmlNode(data) {
    if (!(this instanceof HtmlNode)) {
      return new HtmlNode(data);
    }
    if (vartype(data) == 'string') {
      var doc = htmlparser.HTMLtoDOM(data), body;
      if (doc) {
        this._xmlNode = doc.getElementsByTagName('body')[0];
      } else {
        doc = new ActiveXObject('Msxml.DOMDocument');
        this._xmlNode = doc.documentElement;
      }
      this._xmlDoc = doc;
    } else {
      this._xmlNode = data;
      this._xmlDoc = data.ownerDocument;
      if (!this._xmlDoc) {
        this._xmlDoc = new ActiveXObject('Msxml.DOMDocument');
        this._xmlDoc.documentElement = data;
      }
    }
  }
  HtmlNode.prototype = {
    /*!
     * Traversal Functions
     */
    firstChild: function() {
      var node = this._xmlNode.firstChild;
      return node ? new HtmlNode(node) : null;
    },
    parentNode: function() {
      var node = this._xmlNode.parentNode;
      return node ? new HtmlNode(node) : null;
    },
    childNodes: function() {
      var arr = this._xmlNode.childNodes;
      for (var i = 0; i < arr.length; i++) {
        arr[i] = new HtmlNode(arr[i]);
      }
      return arr;
    },
    previousSibling: function() {
      var node = this._xmlNode.previousSibling;
      return node ? new HtmlNode(node) : null;
    },
    nextSibling: function() {
      var node = this._xmlNode.nextSibling;
      return node ? new HtmlNode(node) : null;
    },
    getPath: function() {
      var node = this._xmlNode, path = [getTagPosition(node)];
      while (node = node.parentNode) {
        path.unshift(getTagPosition(node));
      }
      return path.join('/');
    },
    /*!
     * Selection Functions
     */
    xpath: function(path) {
      var node = this._xmlNode;
      path = path.split(/[\/.]/g);
      if (path[0].toLowerCase() == node.tagName.toLowerCase()) path.shift();
      for (var i = 0; i < path.length; i++) {
        var children = node.childNodes, found = null;
        for (var j = 0; j < children.length; j++) {
          if (children[j].tagName.toLowerCase() == path[i].toLowerCase()) {
            found = children[j];
            break;
          }
        }
        if (found) {
          node = found;
        } else {
          return null;
        }
      }
      return new HtmlNode(node);
    },
    xpath: function(selector) {
      var node = this._xmlNode;
      if (node.tagName) {
        path = path.replaceHead('/', '').replaceHead(node.tagName + '/', './');
      }
      var arr = this.getElementsByXPath(path);
      return arr.length ? arr[0] : null;
    },
    getElementsByXPath: function(selector) {
      this._xmlDoc.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
      this._xmlDoc.setProperty("SelectionLanguage", "XPath");
      var arr = [], all = this._xmlNode.selectNodes(selector);
      for (var i = 0; i < all.length; i++) {
        arr[i] = new HtmlNode(all[i]);
      }
      return arr;
    },
    getElementsByAttr: function(name, val) {
      var selector = val ? "//*[@" + name + "='" + val + "']" : "//*[@" + name + "]";
      return this.getElementsByXPath(selector);
    },
    getElementById: function(id) {
      var arr = this.getElementsByAttr('id', id);
      return arr.length ? arr[0] : null;
    },
    getElementsByName: function(name) {
      return this.getElementsByAttr('name', name);
    },
    getElementsByTagName: function(name) {
      return this.getElementsByXPath("//" + name);
    },
    /*!
     * Attribute Functions
     */
    nodeName: function() {
      return this._xmlNode.nodeName;
    },
    nodeType: function() {
      return this._xmlNode.nodeType;
    },
    nodeValue: function() {
      return this._xmlNode.nodeValue;
    },
    getAttribute: function(name) {
      return this._xmlNode.getAttribute(name);
    },
    hasAttribute: function(name) {
      return this._xmlNode.getAttribute(name) !== null;
    },
    setAttribute: function(name, val) {
      this._xmlNode.setAttribute(name, val);
    },
    getAttributeNode: function(name) {
      var val = this._xmlNode.getAttribute(name);
      return (val === null) ? {} : {nodeName: name, nodeValue: val};
    },
    /*!
     * Content Functions
     */
    appendHTML: function(html) {
      var node = this._xmlNode, newNode = new HtmlNode(html)._xmlNode;
      if (newNode.hasChildNodes()) {
        var children = newNode.childNodes;
        for (var i = 0; i < children.length; i++) {
          node.appendChild(children[i]);
        }
      }
    },
    innerHTML: function() {
      var node = this._xmlNode, html = [];
      if (node.hasChildNodes()) {
        var children = node.childNodes;
        for (var i = 0; i < children.length; i++) {
          html.push(children[i].xml);
        }
      }
      return html.join('');
    },
    outerHTML: function() {
      return this._xmlNode.xml;
    }
  };

  function HtmlDoc(html) {
    if (!(this instanceof HtmlDoc)) {
      return new HtmlDoc(html);
    }
    this._doctype = '<!DOCTYPE html>';
    this._xmlDoc = htmlparser.HTMLtoDOM(html);
    this._xmlNode = this._xmlDoc.documentElement;
  }
  HtmlDoc.prototype = Object.create(HtmlNode.prototype);
  Object.append(HtmlDoc.prototype, {
    doctype: function(str) {
      if (arguments.length) {
        this._doctype = str;
      }
      return this._doctype;
    },
    outerHTML: function() {
      var html = this._xmlNode.xml;
      if (this._doctype) {
        html = this._doctype + html;
      }
      return html;
    }
  });

  return {
    HtmlNode: HtmlNode,
    HtmlDoc: HtmlDoc,
    isHtmlDoc: function(obj) {
      return (obj instanceof HtmlDoc);
    },
    isHtmlNode: function(obj) {
      return (obj instanceof HtmlNode);
    }
  }

}
