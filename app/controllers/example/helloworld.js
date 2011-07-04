bind('ready', function() {

  app('/example/hello', function() {
    res.die('text/html', '<p>Hello World</p>');
  });


  app('/example/hello/:name', function(params) {
    res.die('text/html', '<p>Hello ' + htmlEnc(params('name')) + '</p>');
  });


  app('/example/json', function() {
    res.die({example: 'json', array: [1, 2, 'three'], bool: false});
  });


  app('/example/send-email', function() {
    var net = lib('net');
    net.sendEmail({
      to:        'john.doe@gmail.com',
      from:      'sstur@me.com',
      subject:   'Test Message',
      body_text: 'Hello. This is a test email.'
    });
    res.die('Successfully Sent Email.');
  });


});
