<script language="javascript" runat="server">
/**
 * Dispatch request to appropriate controller script based on
 *   a set of primitive routing rules.
 *
 * NOTE: Application("AppRoot") must be defined in global.asa.
 *
 */
var approot = Application("AppRoot")
	, req_uri = Request.QueryString.Item();

Response.Clear();
Response.ContentType = "text/plain";
if (req_uri.match(/^\/admin\//)) {
	Server.Execute(approot + "main.asp");
} else
if (req_uri.match(/^\//)) {
	Server.Execute(approot + "main.asp");
} else {
	Response.Write("Error Parsing: " + req_uri);
}
Response.End();
</script>
