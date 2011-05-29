function lib_domwrapper() {

  var htmlparser = lib('htmlparser'), xmldom = lib('xmldom');

  var RE_DOCTYPE = /<!DOCTYPE(\s+([\w-]+|"[^"]*"))*>/;

  var emptyElements = {area: true, base: true, basefont: true, br: true, col: true, frame: true,
    hr: true, img: true, input: true, isindex: true, link: true, meta: true, param: true, embed: true};
  var noencElements = {script: true, style: true};
  var nodeTypeNames = [0, 'ELEMENT_NODE', 'ATTRIBUTE_NODE', 'TEXT_NODE', 'CDATA_SECTION_NODE',
    'ENTITY_REFERENCE_NODE', 'ENTITY_NODE', 'PROCESSING_INSTRUCTION_NODE', 'COMMENT_NODE',
    'DOCUMENT_NODE', 'DOCUMENT_TYPE_NODE', 'DOCUMENT_FRAGMENT_NODE', 'NOTATION_NODE'];

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
    //If there is a DOCTYPE element, save and remove it
    html = html.replace(RE_DOCTYPE, function(str) {
      return (doc.doctype = str) && '';
    });
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
        if (!elems.length) return;
        elems.length -= 1;
        curParentNode = elems[elems.length - 1];
      },
      chars: function(chars) {
        if (noencElements[curParentNode.tagName]) {
          curParentNode.appendChild(doc.createTextNode(chars));
        } else {
          curParentNode.appendChild(doc.createTextNode(htmlDec(chars)));
        }
      },
      comment: function(text) {
        curParentNode.appendChild(doc.createComment(text));
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
    html = html.replace(RE_DOCTYPE, function(str) {
      return (doc.doctype = str) && '';
    });
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
        if (!elems.length) return;
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
    ownerDocument: function() {
      return new HtmlDoc(this._xmlNode.ownerDocument);
    },
    childNodes: function() {
      var arr = [];
      forEach(this._xmlNode.childNodes, function(i, node) {
        arr.push(new HtmlNode(node));
      });
      return arr;
    },
    nodeTypeName: function() {
      return nodeTypeNames[this._xmlNode.nodeType];
    },
    getElementsByName: function(val) {
      return this.getElementsByAttr('name', val);
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
    },
    toJSON: function() {
      var node = this._xmlNode, desc = {nodeType: this.nodeTypeName(), nodeName: node.nodeName};
      if (~[3, 4, 8].indexOf(node.nodeType)) desc.nodeValue = node.nodeValue;
      desc.childNodes = node.childNodes.length;
      return {HtmlNode: desc};
    }
  };
  //Properties returning primitive value
  forEach('nodeName nodeType nodeValue'.w(),
    function(i, name) {
      HtmlNode.prototype[name] = function() {
        return this._xmlNode[name];
      };
    });
  //Methods returning one or more Node
  forEach('cloneNode getElementById getElementsByTagName getElementsByAttr'.w(),
    function(i, name) {
      HtmlNode.prototype[name] = function() {
        var node = this._xmlNode;
        return wrapNodes(node[name].apply(node, arguments));
      };
    });
  //Properties returning single Node
  forEach('parentNode firstChild lastChild previousSibling nextSibling'.w(),
    function(i, name) {
      HtmlNode.prototype[name] = function() {
        var node = this._xmlNode[name];
        return node ? new HtmlNode(node) : null;
      };
    });
  //Methods accepting one or more Node as argument
  forEach('appendChild replaceChild insertBefore removeChild'.w(),
    function(i, name) {
      HtmlNode.prototype[name] = function() {
        var node = this._xmlNode,
        args = toArray(arguments).map(function(el) {
          return el._xmlNode;
        });
        node[name].apply(node, args);
      };
    });
  //Other Methods
  forEach('hasAttributes setAttribute getAttribute hasAttribute removeAttribute'.w(),
    function(i, name) {
      HtmlNode.prototype[name] = function() {
        var node = this._xmlNode;
        return node[name].apply(node, arguments);
      };
    });


  function HtmlDoc(data) {
    if (!(this instanceof HtmlDoc)) {
      return new HtmlDoc(data);
    }
    if (data instanceof xmldom.Document) {
      this._xmlDoc = data;
    } else {
      this._xmlDoc = parseHTML(data);
      if (!this._xmlDoc.doctype) {
        this._xmlDoc.doctype = '<!DOCTYPE html>';
      }
    }
    this._xmlNode = this._xmlDoc.documentElement;
  }
  HtmlDoc.prototype = Object.create(HtmlNode.prototype);
  Object.append(HtmlDoc.prototype, {
    doctype: function(str) {
      if (arguments.length) {
        this._xmlDoc.doctype = str;
      }
      return this._xmlDoc.doctype;
    },
    equals: function(otherHtmlDoc) {
      return (this._xmlDoc === otherHtmlDoc._xmlDoc);
    },
    nodeType: function() {
      return this._xmlDoc.nodeType;
    },
    ownerDocument: function() {
      return null;
    },
    outerHTML: function() {
      var html = new HtmlNode(this._xmlNode).outerHTML();
      if (this._xmlDoc.doctype) {
        html = this._xmlDoc.doctype + html;
      }
      return html;
    },
    toJSON: function() {
      var doc = this._xmlDoc, desc = {nodeType: 'DOCUMENT_NODE', nodeName: doc.nodeName};
      desc.documentElement = doc.documentElement ? doc.documentElement.nodeName : null;
      return {HtmlDoc: desc};
    }
  });
  var list = 'createElement createDocumentFragment createTextNode createAttribute createComment createCDATASection'.w();
  list.each(function(i, name) {
    HtmlDoc.prototype[name] = function() {
      var doc = this._xmlDoc;
      return new HtmlNode(doc[name].apply(doc, arguments));
    };
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
