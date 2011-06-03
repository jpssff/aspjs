bind('ready', function() {

  app('/test/suite', function() {
    var templ = lib('templ');
    var html = templ.render('test/test-suite');
    res.die(html, 'text/html');
  });

  app('/test/url-params/:hex/:word/:number', function(p) {
    describe('url params', function() {
      it('should parse the url', function() {
        expect(p('hex')).toEqual('A0B1C2');
        expect(p('word')).toEqual('uñíçôdë');
        expect(p('number')).toEqual('123');
      });
    });
    res.die({result: 'success'});
  });

  app('/test/url-qs', function() {
    describe('querystring', function() {
      it('should parse the qs', function() {
        expect(req.qs('hex')).toEqual('A0B1C2');
        expect(req.qs('word')).toEqual('uñíçôdë');
        expect(req.qs('number')).toEqual('123');
      });
    });
    res.die({result: 'success'});
  });

  app('POST:/test/url-post/:word', function(p) {
    describe('Request-Post', function() {
      it('should parse the post data', function() {
        expect(p('word')).toEqual('tést');
        expect(req.post('hex')).toEqual('A0B1C2');
        expect(req.post('word')).toEqual('uñíçôdë');
        expect(req.post('number')).toEqual('123');
      });
    });
    res.die({result: 'success'});
  });

});
