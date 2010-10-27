app.on('ready',function() {
	
	//default route (home page)
	app('/',function(p){
		
		var obj = Object.create(global);
		res.die(typeof obj.app);
		
	});
	
	//docstore test
	app('/docstore',function(p){
		
		var json = require('json')
			, docstore = require('docstore')
			, db = docstore.getDB('main');
		
		var items = db.get('items');
		
		var person = items.find({name:'simon'})[0]
		if (!person) {
			person = items.save({name:'simon',dob:new Date(Date.parse('1981/12/7')),age:28});
		}
		person.name = 'sturmer';
		items.save(person,true);
		res.die(items.find({name:'sturmer'}));
		
	});
	
	//dynamic image serving
	app('/img/*',function(params){
		var a = [];
		a.push('You requested image: ' + params)
		a.push(req.url)
		res.die(a.join('\r\n'));
	});
	
	//display login page
	app('/admin/*?',function(){
		var templ = require('templ');
		templ.render('login',{title:'Admin Login'});
	});
	
	//error handling test
	app('/error/:err?',function(p){
		//var err = p('err') || 'Example Error';
		throw new Error(toArray(arguments));
	});
	
	//test route parsing
	app('/test/:one/:two?',function(p){
		res.die('{params: {first: ' + p('one') + ', second: ' + p('two') + '}}');
	});
	
	
});
