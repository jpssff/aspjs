<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<script runat="server" language="javascript" src="app/system/adapters/asp.js"></script>
<script runat="server" language="javascript" src="app/system/core.js"></script>
<script runat="server" language="javascript" src="app/system/lib/globals.js"></script>
<script runat="server" language="javascript" src="app/system/lib/collection.js"></script>
<script language="javascript" runat="server">
/**
 * Initial Request Dispatcher
 *
 */
dispatch({
  "/test": "test.asp",
  "/": "main.asp"
});
</script>
