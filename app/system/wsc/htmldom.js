var htmlparser = {};
lib_htmlparser(htmlparser);

function createDoc(html) {
  return new HtmlDoc(html);
}

//function createDoc(html) {
//  try {
//    var doc = htmlparser.HTMLtoDOM(html);
//  } catch(e) {
//    if (e.message) {
//      return e.message;
//    }
//    return e;
//  }
//  return doc;
//}
