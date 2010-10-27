<script runat="server" language="javascript" src="config.js"></script>
<!--#include file="core/_inc.asp" -->
<!--#include file="lib/_inc.asp" -->
<script runat="server" language="javascript" src="main.js"></script>
<script runat="server" language="javascript">

/**
 * Process saved error reports as soon as application is ready.
 *
 */
app.on('ready',function(){
	if (global.err_report)
	appvars(/^Error_(\d+)$/i,function(n,val){
		err_report(val);
		return null;
	});
});

/**
 * Main application handler.
 *
 * NOTES: This script handles all requests to dynamic content. It
 *        loads global functions, request/response objects and all 
 *        application modules. It then passes execution to the main
 *        function in the main.js script.
 *
 */
res.clear();
app.trigger('ready');
if (global.main) main();
app.trigger('complete');
res.end();

</script>
