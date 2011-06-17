bind('ready', function() {

  function recordCreationError(errors) {
    res.die({success: false, error: errors});
  }

  app('/admin/populate/pages', function(p) {
    var pages = {}, templates = {};

    //Create Templates
    templates['home'] = Models.PageTemplate.create({
      name: 'Home template'
    });
    templates['home'].save();

    templates['content'] = Models.PageTemplate.create({
      name: 'Content template'
    });
    templates['content'].save();

    //Create Pages
    //pages['home'] = Models.Page.create({
    pages['home'] = templates['home'].createPage({
      name: 'Home'
    }).save();

    pages['about-us'] = templates['content'].createPage({
      name: 'About Us'
    }).save();

    pages['services'] = templates['content'].createPage({
      name: 'Services',
      page_id: pages['about-us'].id
    }).save();

    pages['location'] = templates['content'].createPage({
      name: 'Location',
      page_id: pages['about-us'].id
    }).save();

    pages['contact-us'] = templates['content'].createPage({
      name: 'Contact Us'
    }).save();

//    var html = lib('net').httpRequest('http://www.zdnet.com/');
//    pages['about-us'].set('markup', html);
//    var result = pages['about-us'].save();
//    res.die(result);

    //res.die(templates['content'].getPageList());
    res.die(pages['about-us'].getChildList());
    res.die({success: true, page_id: pages['home'].id});
  });

});
