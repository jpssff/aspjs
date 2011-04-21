/**
 * Application Specific Configuration. This function
 * should return an object of key/value pairs that
 * is specific to this application or deployment.
 *
 */
function lib_appcfg() {
	return {
		
		//Application Title
		app_title: "Web Application",
		
		//Defaults
		defaults:{
			//Timezone Offset
			timezone:{
				offset:10 * 60
			}
		},
		
		//Email Notifications
		notify:{
			//default from address
			'from':'Simon Sturmer <simon.sturmer@gmail.com>',
			//webmaster receives error reports
			'webmaster':'simon.sturmer@gmail.com',
			//admin receives member, signup and other notifications
			'admin':'simon.sturmer@gmail.com',
			//default receives all other notifications
			'default':'simon.sturmer@gmail.com'
		},
		
		//Email Relay
		smtp: {
			host: 'localhost',
			port: '25',
			user: 'username',
			pass: 'password'
		},
		
		//Templating Engine
		template: {
			defaults: {
				date_format: '{d} {c} {yyyy} {h}:{nn}{p}'
			}
		},
		
		//301 Redirects (Processed before any routes)
		redir: {
			'/admin/':'/admin'
		}
		
		//end of config options
	};
}