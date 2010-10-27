<script runat="server" language="javascript" src="config.js"></script>
<script runat="server" language="javascript" src="core/globals.js"></script>
<script runat="server" language="javascript" src="core/prototypes.js"></script>
<script runat="server" language="javascript" src="app_init.js"></script>
<script runat="server" language="javascript">
/**
 * Application Init Handler.
 *
 * NOTES: This script handles the Appliction_OnStart event. It
 *        loads global objects and application classes. It then
 *        passes execution to the init function in the
 *        appinit.js script.
 *
 */
if (global.app_init) app_init();
</script>
