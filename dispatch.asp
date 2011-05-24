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
  "/test": {
    "controller": "test",
    "inc": "jasmine.js"
  },
  "/": "main"
});
</script>
