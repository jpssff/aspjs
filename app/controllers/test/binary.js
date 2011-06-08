bind('ready', function() {

  app('/test/binary', function(p) {
    var a = new Binary('«');
    res.die(a.toString('hex'));
    var b = new Binary('\uC548\uB155\uD558\uC138\uC694', 'utf16');
    res.die([b.toString('hex'), b.length()]);
  });

  app('/test/md5/:str', function(p) {
    var out = [];
    out.push(p('str'));
    out.push(new Binary(p('str')).md5().toString('hex'));
    res.die(out.join('\r\n'));
  });

});
