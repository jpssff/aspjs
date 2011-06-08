bind('ready', function() {

  app('/test/db', function(p) {
    var docstore = lib('docstore')
      , store = docstore.getStore('main')
      , members = store.get('items');
    var m = {first: 'Jane', last: 'Doe'};
    m = members.save(m);
    m.last = 'Tester';
    members.save(m);
    res.die([m, m.__meta]);
  });

  app('/test/docstore', function(p) {
    var docstore = lib('docstore')
      , store = docstore.getStore('main');

    var items = store.get('items');

    var person = items.find({name: 'simon'})[0]
    if (!person) {
      person = items.save({name: 'simon', dob: Date.fromString('1970/01/01'),age:28});
    }
    person.name = 'asdf';
    items.save(person, true);
    res.die(items.find({name:'asdf'}));
  });

});
