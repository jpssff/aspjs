<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<script language="javascript" runat="server" src="app/system/lib/json.js"></script>
<script language="javascript" runat="server">
/**
 * Handle Server Side Errors.
 *
 */
var e = Server.GetLastError();

//Parse Request URI
var path = Request.QueryString.Item().match(/^([^:\/]+:\/\/)?([^\/]*)([^?&]*)(\?|&|$)(.*)/)[3] || "/";

var xReqWith = Request.ServerVariables("HTTP_X_REQUESTED_WITH").Item();
var isXHR = (String(xReqWith).toLowerCase() == 'xmlhttprequest');

//Get Error Details
var err = {};
err['Date / Time'] = isXHR ? new Date() : new Date().toUTCString();
err['Requested Resource'] = path;
err['Category'] = e.category.replace(/Microsoft (\w+)Script/i, "Script");
err['Facility Code'] = (e.number>>16 & 0x1FFF);
err['Number'] = (e.number & 0xFFFF);
err['Description'] = e.description.replace('Active Server Pages', 'Server Side Script');
err['File'] = e.file;
err['Line'] = e.line;
if (e.aspdescription) {
  err['Details'] = e.aspdescription;
}

var a = [];
a.push('500 Internal Error');
for (var n in err) {
  if (err.hasOwnProperty(n)) a.push(n + ': ' + err[n]);
}
a.push('');

Response.Clear();
Response.Charset = "utf-8";
Response.Status = "500 Internal Server Error";
if (isXHR) {
  Response.ContentType = "application/json";
  try {
    var json = lib_json();
    Response.Write(json.stringify({error: true, details: err}, true));
  } catch(e) {
    Response.Write('{"error":true,"details":{}}');
  }
} else {
  Response.ContentType = "text/plain";
  Response.Write(a.join("\r\n"));
}
Response.End();
</script>
