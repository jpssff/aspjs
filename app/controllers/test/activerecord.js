bind('ready', function() {

  app('/test/active-record', function(p) {
    var out = [];
    var ActiveRecord = lib('activerecord');
    ActiveRecord.connect(ActiveRecord.Adapters.Access);
    var User = ActiveRecord.create('users', {
      username: '',
      password: '',
      post_count: 0,
      profile: ''
    }, {
      getProfileWordCount: function () {
        return this.get('profile').split(/\s+/).length;
      }
    });

    var jessica = User.create({
      username: "Jessica",
      password: "rabbit"
    });
    jessica.set('password', 'rabbit123');
    jessica.save();
    //jessica.destroy();

    res.die(jessica);
    //res.die([req.method(), req.url('path'), req.params()]);
  });

});
