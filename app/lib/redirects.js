register("redirects",function(){
	
	app.on('ready',function(){
		var list = require('redirects'), url = req.url.base;
		if (Object.exists(list,url)) res.redirect(list[url]);
	});
	
	return appcfg().redir || {};
});