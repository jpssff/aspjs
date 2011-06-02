function lib_domwrapper() {

  var htmlparser = lib('htmlparser'), xmldom = lib('xmldom');

  var RE_DOCTYPE = /<!DOCTYPE(\s+([\w-]+|"[^"]*"))*>/;
  var EL_EMPTY = {area: true, base: true, basefont: true, br: true, col: true, frame: true,
    hr: true, img: true, input: true, isindex: true, link: true, meta: true, param: true, embed: true};
  var EL_NOENC = {script: true, style: true};
  var NODE_TYPES = [0, 'ELEMENT_NODE', 'ATTRIBUTE_NODE', 'TEXT_NODE', 'CDATA_SECTION_NODE',
    'ENTITY_REFERENCE_NODE', 'ENTITY_NODE', 'PROCESSING_INSTRUCTION_NODE', 'COMMENT_NODE',
    'DOCUMENT_NODE', 'DOCUMENT_TYPE_NODE', 'DOCUMENT_FRAGMENT_NODE', 'NOTATION_NODE'];

  function appendHTML(node, html) {
    var doc = node.ownerDocument, elems = [];
    var curParentNode = node;
    htmlparser.parse(html, {
      start: function(tag, attrs, unary) {
        var elem = doc.createElement(tag);
        for (var i = 0; i < attrs.length; i++) {
          elem.setAttribute(attrs[i].name, attrs[i].value);
        }
        (curParentNode || node).appendChild(elem);
        if (!unary) {
          elems.push(elem);
          curParentNode = elem;
        }
      },
      end: function(tag) {
        //out.push(elems.map(function(el){ return el.tagName }).join(' > '));
        if (!elems.length) return;
        elems.length -= 1;
        curParentNode = elems[elems.length - 1];
      },
      chars: function(text) {
        (curParentNode || node).appendChild(doc.createTextNode(text));
      },
      cdata: function(text) {
        (curParentNode || node).appendChild(doc.createCDATASection(text));
      },
      doctype: function(doctype, params) {
        if (!doc.doctype) {
          doc.doctype = doctype;
        }
      },
      comment: function(text) {
        (curParentNode || node).appendChild(doc.createComment(text));
      }
    });
    //res.die(out.join('\n'));
    return node;
  }

  function parseHTMLtoDoc(html) {
    var doc = new xmldom.Document(), frag = doc.createDocumentFragment(), struct = {};
    appendHTML(frag, html);
    forEach(['head', 'body'], function(i, tag) {
      var el;
      if (el = frag.getElementsByTagName(tag)[0]) {
        struct[tag] = el;
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      } else {
        struct[tag] = doc.createElement(tag);
      }
    });
    var rootEl;
    if (rootEl = frag.getElementsByTagName('html')[0]) {
      while (rootEl.childNodes.length) {
        rootEl.removeChild(rootEl.lastChild);
      }
    } else {
      rootEl = doc.createElement("html");
    }
    rootEl.appendChild(struct['head']);
    rootEl.appendChild(struct['body']);
    if (!struct['body'].childNodes.length) {
      for (var i = 0; i < frag.childNodes.length; i++) {
        var el = frag.childNodes[i];
        if (['html', 'head', 'body'].indexOf(el.nodeName) < 0) {
          struct['body'].appendChild(el);
        }
      }
    }
    doc.appendChild(rootEl);
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
      if (node.tagName && node.tagName.toLowerCase() == tagName) i++;
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
      return NODE_TYPES[this._xmlNode.nodeType];
    },
    getElementsByName: function(val) {
      return this.getElementsByAttribute('name', val);
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
    innerHTML: function(html) {
      var children = this.childNodes();
      if (arguments.length == 1) {
        for (var i = 0; i < children.length; i++) {
          this.removeChild(children[i]);
        }
        return this.appendHTML(html);
      } else {
        html = [];
        for (var i = 0; i < children.length; i++) {
          html.push(children[i].outerHTML());
        }
        return html.join('');
      }
    },
    outerHTML: function() {
      return this._xmlNode.xml(EL_EMPTY, EL_NOENC);
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
  forEach('cloneNode getElementById getElementsByTagName getElementsByAttribute'.w(),
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
      this._xmlDoc = parseHTMLtoDoc(data);
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
    documentElement: function() {
      return new HtmlNode(this._xmlNode);
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
      var doc = this._xmlDoc, html = [];
      if (doc.doctype) {
        html.push(doc.doctype);
      }
      html.push('<html' + doc.documentElement.attribsToXML() + '>');
      html.push(toHTML('head', doc.getElementsByTagName('head')[0]));
      html.push(toHTML('body', doc.getElementsByTagName('body')[0]));
      html.push('</html>');
      return html.join('\r\n');
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

  function toHTML(tag, node) {
    if (node && node.xml) {
      return node.xml(EL_EMPTY, EL_NOENC);
    }
    return '<' + tag + '></' + tag + '>';
  }

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
