/**
 * Application Init Script.
 *
 * NOTES: This script is called when the application starts up,
 *        which happens when the server is restarted or the ASP worker
 *        process or application pool restarts.
 *        This is a good place to perform general maintenance tasks
 *        like cleaning up temp files or pre-compiling views.
 *
 */
function app_init() {

	Application('starttime') = new Date().toUTCString();

}
