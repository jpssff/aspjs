function lib_path() {
	var path = function(p){
		return path.join(__appdir,p);
	};
	path.join = function(){
		var args = toArray(arguments);
		return args.join('/')
			.replace(/[\/\\]+/g,'/')
			.replace(/\/\.\//g,'/')
			.replace(/[^\/]+\/\.\.\//g,'')
			.replace(/\//g,'\\')
			.replace(/^\\(.*)/,'\\\\$1');
	};
	return path;
}

function lib_fs() {

	var fs = {}, vars = {files:{},dirs:{}}, path = require('path');
	
	fs.escape = function(filename) {
		return String(filename).replace(/[^\w\d_-{}$!+()=]/g,function(char){
			return escape(char);
		});
	};

	fs.getFSO = function() {
		return vars.fso || (vars.fso = new ActiveXObject("Scripting.FileSystemObject"));
	};
	
	fs.fileExists = function(f) {
		f = path(f);
		if (vars.files[f]) return (vars.files[f] == 'true');
		var r = fs.getFSO().FileExists(f);
		vars.files[f] = r.toString();
		return r;
	};
	
	fs.dirExists = function(f) {
		f = path(f);
		if (vars.dirs[f]) return (vars.dirs[f] == 'true');
		var r = fs.getFSO().FolderExists(f);
		vars.dirs[f] = r.toString();
		return r;
	};
	
	fs.moveFile = function(f,l) {
		f = path(f), l = path(l);
		fs.getFSO().MoveFile(f,l);
	};
	
	fs.copyFile = function(f,l) {
		f = path(f), l = path(l);
		fs.getFSO().CopyFile(f,l);
	};
	fs.deleteFile = function(f) {
		f = path(f);
		fs.getFSO().DeleteFile(f,true);
	};
	
	fs.createDir = function(f,n) {
		f = path(f).replaceTail('\\','');
		if (arguments.length == 1) {
			var a = f.split('\\'); var n = a.pop(); f = a.join('\\');
		}
		try {
			fs.getFSO().GetFolder(f).SubFolders.Add(n);
		} catch(e) {}
	};
	
	fs.removeDir = function(f,r) {
		f = path(f);
		try {
			fs.getFSO().DeleteFolder(f,true);
		} catch(e) {}
	};
	
	fs.readFile = function(f) {
		f = path(f);
		var s = fs.getFSO().OpenTextFile(f);
		var r = s.ReadAll();
		s.Close();
		return r;
	};
	
	fs.writeFile = function(f,s) {
		f = path(f);
		var file = fs.getFSO().OpenTextFile(f,2,true);
		file.Write(s);
		file.Close();
	};
	
	return fs;
}
