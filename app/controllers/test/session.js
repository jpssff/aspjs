bind('ready', function() {

  var Session = lib('session');

  app('/test/session/run', function() {

    //Initializes session store with default options (specified in config)
    var session = Session.init('memory, autosave');
    //  session = Session.init({memory: true, autosave: true});
    session('name', 'value') // save to session variable
    session('name', {name: 'value', items: [1, 2, '3']}); // save complex data type
    session('name') //= 'value'
    session.save() //flush changes to underlying datastore (app shared memory or database)
    session('foo', 'bar')
    session.load(); //reload from datastore
    session('foo') //= '' (empty string)
    

    res.die(qunit.getTestResults());

  });

});
