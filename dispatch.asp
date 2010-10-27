<script language="javascript" runat="server">
/**
 * Initialize request and call main appliction script.
 *
 * NOTE: Application("AppRoot") is defined in global.asa.
 *
 */
Response.Clear();
Response.ContentType = "text/plain";
if (Request.QueryString.Item().match(/^\//)) {
	//Response.Write(Request.QueryString.Item() + '\n');
	Server.Execute(Application("AppRoot") + "main.asp");
} else {
	Response.Write(Request.QueryString.Item())
}
Response.End();
</script>
