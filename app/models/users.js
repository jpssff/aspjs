bind('ready', function() {

  app.model('User', {
    table: 'users',
    properties: {
      name: '',
      username: '',
      password: ''
    },
    methods: {
      validate: function () {
        var self = this, pw = self.get('password');
        if (!pw || pw.length < 5) {
          self.addError('Password must be 5 characters or longer.');
        }
        var existingUsers = Models.User.findAllByUsername(self.username);
        forEach(existingUsers, function(i, rec) {
          if (rec.id !== self.id) {
            self.addError('Username `' + self.username + '` is already in use.');
            return false;
          }
        });
      },
      getPasswordHash: function () {
        var pw = this.get('password');
        return new Binary(pw).md5().toString('hex');
      }
    }
  });


});
