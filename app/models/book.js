bind('ready', function() {

  app.model('Author', {
    table: 'authors',
    fields: {
      first_name: '',
      last_name: ''
    },
    callback: function() {
      this.hasMany('Book');
    }
  });

  app.model('Book', {
    table: 'books',
    fields: {
      title: '',
      publisher: '',
      year: ''
    },
    methods: {
      getCopyright: function () {
        return '©' + this.year + ' ' + this.publisher;
      }
    },
    callback: function() {
      this.belongsTo('Author');
      //this.validatesLengthOf('title', {min: 5});
    }
  });

});
