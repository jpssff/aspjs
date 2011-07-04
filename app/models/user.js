bind('ready', function() {

  app.model('Group', {
    table: 'groups',
    fields: {
      name: ''
    },
    methods: {
      hasPriv: function (priv) {
        //TODO: return bool
      },
      getPrivileges: function () {
        //TODO: return array of privileges
      }
    },
    callback: function() {
      this.hasMany('Privilege');
      this.hasMany('User');
    }
  });


  app.model('Privilege', {
    table: 'privileges',
    fields: {
      name: ''
    }
  });


  app.model('User', {
    table: 'users',
    fields: {
      name: '',
      username: '',
      password: ''
    },
    methods: {
      validate: function() {
        var user = this, pw = user.get('password');
        if (!pw || pw.length < 5) {
          user.addError('Password must be 5 characters or longer.');
        }
        var existingUsers = Models.User.findAllByUsername(user.username);
        forEach(existingUsers, function(i, rec) {
          if (rec.id !== user.id) {
            user.addError('Username `' + user.username + '` is already in use.');
            return false;
          }
        });
      },
      getPasswordHash: function() {
        var pw = this.get('password');
        return new Binary(pw).md5().toString('hex');
      }
    },
    callback: function() {
      this.belongsTo('Group');
    }
  });


});
