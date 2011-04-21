register('ready', function() {
	
	/*
	 * Default Route (Home Page)
	 *
	 */
	app('/', function() {
		res.die('<h1>Home</h1><p>Welcome to the home page.</p>', 'text/html');
	});

});
