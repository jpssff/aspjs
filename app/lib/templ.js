/**
 * Templating Engine: This module presents functions for reading,
 * compiling and rendering templates / pages from the views folder.
 *
 * The template files are stored in subdirectories of the view folder
 * and must have the html file extension. There are three types of
 * these files.
 *
 * - Blocks are snippets of HTML that can be included on any page or
 *   template via the <block:name> tag.
 * - Pages are partial or full pages that may or may not specify a
 *   parent template.
 * - Templates are HTML files with special tags to specify regions and
 *   blocks. Templates can belong to other templates for nesting.
 *
 */
function lib_templ() {
	var vars = {}, templ, fso, path = require('path');
	var std_subs = {
		'year':__date.getFullYear()
	};
	function readfile(f) {
		if (!fso) fso = new ActiveXObject("Scripting.FileSystemObject");
		try {
			var stream = fso.OpenTextFile(path(f));
		} catch(e) { res.die('Error Opening File: ' + f); }
		var data = stream.ReadAll();
		stream.Close();
		return data;
	};
	function getparts(html) {
		var stag = /<region:([-\w]+)>/i, etag = /<\/region>/i;
		var parts = {}, arr = html.split(/<\/region>/i);
		arr.each(function(i,part){
			var match = stag.exec(part);
			if (match) parts[match[1]] = part.replace(stag,'');
		});
		return parts;
	};
	templ = {
		compile: function(name,subs){
			var path = (subs) ? 'templ/' + name : 'pages/' + name;
			var html = readfile('views/' + path + '.html');
			if (subs) Object.each(subs,function(n,val){ html = html.replace(new RegExp('<{region:(' + RegExp.escape(n) + ')}>','ig'),val); });
			var rex = /<!parent-template:([-\w]+)>/i;
			var match = rex.exec(html);
			if (match) {
				html = templ.compile(match[1],getparts(html.replace(rex,'')));
			}
			html = html.replace(/\<{block:([-\w]+)\}>/ig,function(tag,name){
				return readfile('views/blocks/' + name + '.html');
			});
			return html;
		},
		render: function(html,vars){
			if (html.match(/^([-\w]+)$/)) html = templ.compile(html);
			vars = Object.append(std_subs,vars);
			html = html.replace(/[\{\[]([-\w]+)[\]\}]/ig,function(tag,name){
				return (Object.exists(vars,name)) ? vars[name] : tag;
			});
			res.die(html,'text/html');
		}
	}
	return templ;
}
