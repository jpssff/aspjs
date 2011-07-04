bind('ready', function() {

  app('/example/create-book', function() {

    var author = Models.Author.create({
      first_name: 'Simon',
      last_name: 'Sturmer'
    });

    var book1 = author.createBook({
      title: 'Bad Ass Javascript',
      publisher: 'open-source',
      year: '2011'
    });

    var book2 = author.createBook({
      title: 'Javascript Ninja Tricks',
      publisher: 'open-source',
      year: '2011'
    });

    res.die(author.getBookCount());
  });

  app('/example/books', function() {

    var books = Models.Book.find({all: true});

    res.die(books);
  });

});
