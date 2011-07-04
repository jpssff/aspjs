/**
 * System Library
 *
 * Presents functions for interacting with the filesystem, logging and path manipulation.
 *
 */
if (!this.lib_system) this.lib_system = lib_system;
function lib_system(sys) {
  
  /*
   * Private Variables
   */
  var vars = {files: {}, dirs: {}}
    , util = lib('util')
    , fspath = server.mappath('/') + '\\';
  
  
  /*
   * Public Properties
   */
  sys.server = server.vars('server');
  sys.platform = server.vars('platform');

  
  /*
   * Path Resolution Functions
   */
   
   
  /*
   * This function is a high level path function that translates
   * a path into something inside the application's root.
   */
  sys.path = function(s) {
    var p = String(s);
    p = p.replaceHead('~/', '');
    return p.startsWith('/') ? p : path.join(__approot, p);
  }
  
  /*
   * This function translates a path into a physical location (with backslashes).
   * It should be used last (after sys.path and path.join) and only inside this
   * library or libraries that directly access the filesystem. Everything else
   * should use app relative paths (~/data/file.txt or /assets/file.html).
   * 
   * You never have to call both sys.path() and sys.mappath() since
   * they do mutually exclusive things.
   */
  sys.mappath = function(s) {
    return fspath + sys.path(s).replaceHead('/', '').replaceAll('/', '\\');
  }
  
  /*
   * This function is a lower level than sys.path(). It joins
   * paths without any regard to approot.
   */
  sys.path.join = function(){
    var a = [];
    toArray(arguments).each(function(i, s){
      if (s) a.push(s);
    });
    var p = a.join('/');
    p = p.replaceAll('//', '/');
    p = p.replaceAll('/./', '/');
    p = p.replace(/[^\/]+\/\.\.\//g, '');
    p = p.replaceTail('/','');
    return p;
  };
  
  /*
   * This function returns the "folder" part of a path including
   * the trailing slash. So /data/file.txt becomes /data/
   */
  sys.path.parent = function(p){
    return p.replace(/\/([^\/]*)$/,'');
  };
  
  /*
   * This function returns the "file" part of a path with no
   * slashes. So /data/file.txt becomes file.txt
   */
  sys.path.member = function(p){
    return p.replace(/^(.*)\//,'');
  };
  
  
  /*
   * Logging / Debugging
   */
  sys.log = function() {
    var logfile, args = toArray(arguments);
    if (args.length > 1) {
      logfile = args.pop();
    }
    if (!logfile) logfile = 'default';
    var date = Date.format(Date.now(),'{yyyy}-{mm}-{dd} {HH}:{nn}:{ss}',true)
      , data = args
      , p = path('~/data/logs/' + logfile.replaceTail('.log','') + '.log');
    var json = lib('json');
    forEach(data, function(i, line){
      data[i] = (isPrimitive(line)) ? String(line) : json.stringify(line, false);
    });
    data.push('');
    try {
      sys.fs.writeTextToFile(p,(date + '\n' + data.join('\n')).replace(/(\r\n|[\r\n])+/g,'\r\n') + '\r\n');
    } catch(e) {
      throw new Error('Error writing to logfile: ' + p);
    }
  }
  
  
  /*
   * Filessytem
   */
  var fs = sys.fs = {}, path = sys.path, mappath = sys.mappath;
   
  fs.escape = function(filename) {
    return String(filename).replace(/[^\w\d!@#$()_\-+={}[],;']/g,function(char){
      return encodeURIComponent(char);
    });
  };

  fs.getFSO = function() {
    return vars.fso || (vars.fso = new ActiveXObject("Scripting.FileSystemObject"));
  };
  
  fs.isFile = function(f) {
    f = path(f);
    if (vars.files[f]) return (vars.files[f] == 'true');
    var r = fs.getFSO().fileExists(mappath(f));
    vars.files[f] = String(r);
    return r;
  };
  
  fs.isDir = function(f) {
    f = path(f);
    if (vars.dirs[f]) return (vars.dirs[f] == 'true');
    var r = fs.getFSO().folderExists(mappath(f));
    vars.dirs[f] = String(r);
    return r;
  };
  
  fs.readTextFile = function(f, enc) {
    if (!enc && app) enc = app.cfg('defaults/charset');
    if (!enc) enc = 'UTF-8';
    if (enc.match(/UTF-?8/i)) {
      return fs.readTextFileStream(f,'UTF-8');
    } else
    if (enc.match(/(UTF-16|UTF-16BE|Unicode)$/i)) {
      return fs.readTextFileStream(f,'UTF-16BE');
    } else {
      var mode = (enc.match(/UTF-16LE/i)) ? -1 : 0;
      var s = fs.getFSO().openTextFile(mappath(f),1,mode);
      var r = s.ReadAll();
      s.Close();
      return r;
    }
  };
  
  fs.readTextFileStream = function(f, enc) {
    var o = new ActiveXObject('ADODB.Stream');
    o.open();
    o.type = 2;
    o.charset = enc;
    o.loadfromfile(mappath(f));
    var s = o.readtext();
    o.close();
    return s;
  };
  
  fs.writeTextToFile = function(f, s, cfg) {
    if (!cfg) cfg = {};
    //TODO: Character Encoding
    var mode = (cfg.overwrite === true) ? 2 : 8;
    var file = fs.getFSO().openTextFile(mappath(f),mode,true);
    file.Write(String(s));
    file.Close();
  };
  
  fs.moveFile = function(f, d) {
    fs.getFSO().moveFile(mappath(f), mappath(d));
  };
  
  fs.copyFile = function(f, d) {
    fs.getFSO().copyFile(mappath(f), mappath(d));
  };
  
  fs.deleteFile = function(f) {
    fs.getFSO().deleteFile(mappath(f), true);
  };
  
  fs.createDir = function(f, n) {
    var p = path.join(f, n);
    try {
      fs.getFSO().getFolder(mappath(path.parent(p))).subFolders.add(path.member(p));
    } catch(e) {
      throw new Error('Error Creating Directory: ' + p);
    }
  };
  
  fs.removeDir = function(f, r) {
    f = path(f);
    try {
      fs.getFSO().deleteFolder(f, true);
    } catch(e) {}
  };

  fs.stat = function(f, deep) {
    var fso = fs.getFSO(), obj, stat = {}, getChildren;
    if (vartype(f) == 'string') {
      f = path(f);
      try {
        obj = fso.getFolder(mappath(f));
        getChildren = true;
      } catch(e) {
        obj = fso.getFile(mappath(f));
      }
    } else {
      obj = f;
    }
    stat.name = obj.name;
    stat.size = obj.size;
    stat.dateCreated = new Date(obj.dateCreated);
    stat.dateLastAccessed = new Date(obj.dateLastAccessed);
    stat.dateLastModified = new Date(obj.dateLastModified);
    if (obj.type == 'File Folder') {
      stat.type = 'folder';
      stat.children = [];
      if (getChildren || deep) {
        stat.folders = [];
        stat._folders = [];
        util.enumerate(obj.subFolders, function(i, item) {
          stat.folders.push(item.name);
          stat._folders.push(fs.stat(item, deep));
          stat.children.push(stat._folders[i]);
        });
        stat.files = [];
        stat._files = [];
        util.enumerate(obj.files, function(i, item) {
          stat.files.push(item.name);
          stat._files.push(fs.stat(item, deep));
          stat.children.push(stat._files[i]);
        });
      }
    } else {
      stat.type = 'file';
      stat._delete = function() {
        obj.Delete();
      };
      stat._move = function(p) {
        obj.move(mappath(p));
      };
      stat.fileType = obj.type;
    }
    return stat;
  };

  
  /*
   * Quick access to useful functions
   */
  sys.readTextFile = fs.readTextFile;
  sys.writeTextToFile = fs.writeTextToFile;
  
  
  /*
   * Export System Object
   */
  return sys;
  
}
