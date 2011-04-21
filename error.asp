<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<script language="javascript" runat="server">
/**
 * Handle Server Side Errors.
 *
 */
var e = Server.GetLastError();

//Parse Request URI
var path = Request.QueryString.Item().match(/^([^:\/]+:\/\/)?([^\/]*)([^?&]*)(\?|&|$)(.*)/)[3] || "/";

//Parse Error
var a = [];
a.push("500 Internal Error");
a.push("Date / Time: " + new Date().toUTCString());
a.push("Requested Resource: " + path);
a.push("Category: " + e.category.replace(/Microsoft (\w+)Script/i, "Script"));
a.push("Facility Code: " + (e.number>>16 & 0x1FFF));
a.push("Number: " + (e.number & 0xFFFF));
a.push("Description: " + e.description);
a.push("File: " + e.file);
a.push("Line: " + e.line);
if (e.aspdescription) {
	a.push("Details: " + e.aspdescription);
}
a.push("");

Response.Clear();
Response.Charset = "utf-8";
Response.Status = "500 Internal Server Error";
Response.ContentType = "text/plain";
Response.Write(a.join("\r\n").replace("Active Server Pages","Server Side Script"));
Response.End();
</script>
