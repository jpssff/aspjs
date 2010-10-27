/**
 * Application Init Script.
 *
 * NOTES: This script is called when the application starts up,
 *        which happens when the server is started or the worker
 *        process or application pool restarts.
 *
 *        This is a good place to perform general maintenance tasks
 *        like cleaning up temp files.
 *
 */
app.on('ready',function() {

	Application('DT_Init') = new Date().toUTCString();

});
