bind('ready', function() {

  app('/test/active-record', function(p) {
    var User = Models.User;

    var simon = User.create({
      name: "Simon",
      username: "simon",
      password: "asdf"
    });
    simon.set('password', 'abc1234');
    var result = simon.save();

    if (!result) {
      res.die('Error saving user.', simon.getErrors());
    }

    User.update(simon.id, {
      name: 'Simon Sturmer'
    });

    //simon.destroy();

    res.die(simon);
  });

});
