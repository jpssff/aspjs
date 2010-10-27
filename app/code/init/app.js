/**
 * Application Init Processing
 *
 * NOTES: This handles the Appliction_OnStart event to populate
 *        application variables, perform database or file-system
 *        maintenance, clear cache, etc. It then triggers the
 *        ready and complete events that may have been populated
 *        by the init.js script in the app/conrtollers directory.
 *
 */
app.on('init',function(){
	
	//Code here is executed *before* the conroller code
	
});
app.trigger('init');
app.trigger('ready');
app.trigger('complete');
