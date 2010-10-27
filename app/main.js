function main() {
	
	//home page
	app('/',function(p){
		
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
	app('/img/*',function(){
		var a = [];
		a.push('The image you requested does not exist.')
		a.push(req.url)
		app.notfound(a.join('\r\n'));
	});
	
	//test
	app('/null',function(p){
		var obj = {};
		res.die(vartype(null));
	});
	
	//require login for admin pages
	app('/admin/*?',function(){
		var templ = require('templ');
		templ.render('login',{title:'Admin Login'});
	});
	
	//error handling test
	app('/error/:err?',function(p){
		var err = p('err') || 'Example Error';
		throw new Error(err);
	});
	
	//test route parsing
	app('/:one/:two',function(p){
		res.die('params: {first: ' + p('one') + ', second: ' + p('two') + '}');
	});
	
	
}
