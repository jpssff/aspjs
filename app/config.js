/**
 * Application Specific Configuration. This function
 * should return a collection of name/value key pairs
 * that will be available throughout the application.
 *
 */
function appcfg() {
	return {
		//Application Title
		app_title:'Sample Applictaion',
		//Static 302 Redirects (Processed before any routes)
		redir:{
			'/admin':'/admin/'
		}
	}
}