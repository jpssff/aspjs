/**
 * Application Specific Configuration. This function
 * should return an object of key/value pairs that
 * is specific to this applictaion or deployment.
 *
 */
function appcfg() {
	return {
		
		//Application Title
		app_title: 'Sample Applictaion',
		
		//Static 302 Redirects (Processed before any routes)
		redir: {
			'/admin':'/admin/'
		},
		
		//end of config options
		_dt: new Date()
	}
}