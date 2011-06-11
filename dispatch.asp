<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<script runat="server" language="javascript" src="app/system/adapters/asp.js"></script>
<script runat="server" language="javascript" src="app/system/core.js"></script>
<script runat="server" language="javascript" src="app/system/lib/collection.js"></script>
<script runat="server" language="javascript" src="app/system/lib/globals.js"></script>
<script runat="server" language="javascript" src="app/system/lib/system.js"></script>
<script runat="server" language="javascript" src="app/system/lib/util.js"></script>
<script language="javascript" runat="server">
/**
 * Controller Dispatch
 *
 * Maps select URL prefix/patterns to a controller. Uses strict JSON syntax.
 *
 */
dispatch({
  "/admin": "admin",
  "/test": {
    "controller": "test",
    "inc": "qunit.js"
  },
  "/": "main"
});
</script>
