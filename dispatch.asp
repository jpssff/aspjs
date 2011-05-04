<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<script runat="server" language="javascript" src="app/system/adapters/asp.js"></script>
<script runat="server" language="javascript" src="app/system/core.js"></script>
<script runat="server" language="javascript" src="app/system/lib/globals.js"></script>
<script runat="server" language="javascript" src="app/system/lib/collection.js"></script>
<script language="javascript" runat="server">
/**
 * Dispatch request to appropriate controller
 *
 * IMPORTANT:
 * In a production environment *without* URL Rewrite, be sure to use "/bin/" for application root.
 * This will prevent IIS from serving sensitive application data and source files to the public.
 *
 */
dispatch(function(server, req, res){
  var approot = '/app/';
  var path = req.getURLParts().path;
  if (path.match(/^\/test(\/|$)/)) {
    server.exec(approot + 'test.asp');
  } else
  if (path.match(/^\//)) {
    server.exec(approot + 'main.asp');
  }
  res.headers('content-type', 'text/plain');
  res.write('ERROR: No Route for ' + path);
});
</script>
