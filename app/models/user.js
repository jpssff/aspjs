bind('ready', function() {

  app.model('Person', {
    table: 'people',
    fields: {
      first_name: '',
      last_name: ''
    }
  });

});
