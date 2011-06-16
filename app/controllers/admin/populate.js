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
    pages['home'] = Models.Page.create({
      name: 'Home',
      page_template_id: templates['home'].id
    });
    pages['home'].save();

    pages['about-us'] = Models.Page.create({
      name: 'About Us',
      page_template_id: templates['content'].id
    });
    pages['about-us'].save();

    pages['services'] = Models.Page.create({
      name: 'Services',
      page_template_id: templates['content'].id,
      page_id: pages['about-us'].id
    });
    pages['services'].save();

    pages['location'] = Models.Page.create({
      name: 'Location',
      page_template_id: templates['content'].id,
      page_id: pages['about-us'].id
    });
    pages['location'].save();

    pages['contact-us'] = Models.Page.create({
      name: 'Contact Us',
      page_template_id: templates['content'].id
    });
    pages['contact-us'].save();

    //res.die(templates['content'].getPageList());
    res.die(pages['about-us'].getChildList());
    res.die({success: true, page_id: pages['home'].id});
  });

});
