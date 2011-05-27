function lib_domwrapper() {

  var htmlparser = lib('htmlparser'), xmldom = lib('xmldom');

  var emptyElements = {area: true, base: true, basefont: true, br: true, col: true, frame: true,
    hr: true, img: true, input: true, isindex: true, link: true, meta: true, param: true, embed: true};
  var noencElements = {script: true, style: true};

  function parseHTML(html) {
    var doc = new xmldom.Document(), elems = [];
    // There can be only one of these elements
    var one = {
      html: doc.createElement("html"),
      head: doc.createElement("head"),
      body: doc.createElement("body"),
      title: doc.createElement("title")
    };
    var structure = {
      link: "head",
      base: "head"
    };
    // Populate HTML document
    one.head.appendChild(one.title);
    one.html.appendChild(one.head);
    one.html.appendChild(one.body);
    doc.appendChild(one.html);
    // If we're working with a document, inject contents into the body element
    var curParentNode = one.body;
    htmlparser.parse(html, {
      start: function(tag, attrs, unary) {
        // If it's a pre-built element, then we can ignore its construction
        if (one[tag]) {
          curParentNode = one[tag];
          return;
        }
        var elem = doc.createElement(tag);
        for (var i = 0; i < attrs.length; i++) {
          elem.setAttribute(attrs[i].name, attrs[i].value);
        }
        if (structure[tag]) {
          one[structure[tag]].appendChild(elem);
        } else
        if (curParentNode) {
          curParentNode.appendChild(elem);
        }
        if (!unary) {
          elems.push(elem);
          curParentNode = elem;
        }
      },
      end: function(tag) {
        elems.length -= 1;
        curParentNode = elems[elems.length - 1];
      },
      chars: function(chars) {
        if (noencElements[curParentNode.tagName]) {
          curParentNode.appendChild(doc.createTextNode(chars));
        } else {
          curParentNode.appendChild(doc.createTextNode(htmlDec(chars)));
        }
      }
    });
    return doc;
  }

  function appendHTML(node, html) {
    var doc = node.ownerDocument, elems = [];
    var one = {html: true, head: true, body: true, title: true};
    var structure = {
      link: "head",
      base: "head"
    };
    var curParentNode = node;
    htmlparser.parse(html, {
      start: function(tag, attrs, unary) {
        if (one[tag]) {
          return;
        }
        var elem = doc.createElement(tag);
        for (var i = 0; i < attrs.length; i++) {
          elem.setAttribute(attrs[i].name, attrs[i].value);
        }
        if (curParentNode) {
          if (!structure[tag] || curParentNode.tagName == structure[tag]) {
            curParentNode.appendChild(elem);
          }
        }
        if (!unary) {
          elems.push(elem);
          curParentNode = elem;
        }
      },
      end: function(tag) {
        elems.length -= 1;
        curParentNode = elems[elems.length - 1];
      },
      chars: function(chars) {
        if (noencElements[curParentNode.tagName]) {
          curParentNode.appendChild(doc.createTextNode(chars));
        } else {
          curParentNode.appendChild(doc.createTextNode(htmlDec(chars)));
        }
      }
    });
    return doc;
  }

  function wrapNodes(nodes) {
    if (nodes instanceof xmldom.Node) {
      return new HtmlNode(nodes);
    }
    if (nodes instanceof Array) {
      var arr = new Array(nodes.length);
      forEach(nodes, function(i, node) {
        arr[i] = new HtmlNode(node);
      });
      return arr;
    }
  }
  
  function getTagPosition(node) {
    if (!node.tagName) return '';
    var tagName = node.tagName.toLowerCase(), i = 0;
    while (node = node.previousSibling) {
      if (tagName == node.tagName.toLowerCase()) i++;
    }
    return tagName + '[' + i + ']';
  }

  function HtmlNode(node) {
    if (!(this instanceof HtmlNode)) {
      return new HtmlNode(node);
    }
    this._xmlNode = node;
  }
  HtmlNode.prototype = {
    /*!
     * Traversal Functions
     */
    ownerDocument: function() {
      return new HtmlDoc(this._xmlNode.ownerDocument);
    },
    firstChild: function() {
      var node = this._xmlNode.firstChild;
      return node ? new HtmlNode(node) : null;
    },
    parentNode: function() {
      var node = this._xmlNode.parentNode;
      return node ? new HtmlNode(node) : null;
    },
    childNodes: function() {
      var arr = [], all = this._xmlNode.childNodes;
      for (var i = 0; i < all.length; i++) {
        arr[i] = new HtmlNode(all[i]);
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
    equals: function(otherHtmlNode) {
      return (this._xmlNode === otherHtmlNode._xmlNode);
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
    getElementById: function(id) {
      return wrapNodes(this._xmlNode.getElementById(id));
    },
    getElementsByTagName: function(name) {
      return wrapNodes(this._xmlNode.getElementsByTagName(name));
    },
    getElementsByAttr: function(name, val) {
      return wrapNodes(this._xmlNode.getElementsByAttr(name, val));
    },
    getElementsByName: function(val) {
      return this.getElementsByAttr('name', val);
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
      var node = this._xmlNode;
      appendHTML(node, html);
    },
    innerHTML: function() {
      var html = [], children = this.childNodes();
      for (var i = 0; i < children.length; i++) {
        html.push(children[i].outerHTML());
      }
      return html.join('');
    },
    outerHTML: function() {
      return this._xmlNode.xml(emptyElements, noencElements);
    }
  };

  function HtmlDoc(data) {
    if (!(this instanceof HtmlDoc)) {
      return new HtmlDoc(data);
    }
    if (data instanceof xmldom.Document) {
      this._xmlDoc = data;
    } else {
      this._xmlDoc = parseHTML(data);
      this._docType = this._xmlDoc.docType || '<!DOCTYPE html>';
    }
    this._xmlNode = this._xmlDoc.documentElement;
  }
  HtmlDoc.prototype = Object.create(HtmlNode.prototype);
  Object.append(HtmlDoc.prototype, {
    docType: function(str) {
      if (arguments.length) {
        this._docType = str;
      }
      return this._docType;
    },
    equals: function(otherHtmlDoc) {
      return (this._xmlDoc === otherHtmlDoc._xmlDoc);
    },
    nodeType: function() {
      return this._xmlDoc.nodeType;
    },
    outerHTML: function() {
      var html = new HtmlNode(this._xmlNode).outerHTML();
      if (this._docType) {
        html = this._docType + html;
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
