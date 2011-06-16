bind('ready', function() {

  app('/admin/page/create', function(p) {
    var result;
    var pageTemplate = Models.PageTemplate.create({
      name: req.post('template_name') || 'Page Template 1'
    });
    result = pageTemplate.save();
    if (!result) {
      res.die('application/json', {success: false, error: page.getErrors()});
    }

    var page = Models.Page.create({
      name: req.post('page_name') || 'Test Page 2',
      page_template_id: pageTemplate.id,
      page_id: Models.Page.find(123).id
    });
    result = page.save();
    if (!result) {
      res.die('application/json', {success: false, error: page.getErrors()});
    }

    //res.die(pageTemplate.getPageList());
    res.die(page.getChildList());
    res.die('application/json', {success: true, page_id: page.id});
  });

  app('/admin/pages/list/:parent?', function(p) {
    var pages;
    if (p('parent')) {
      pages = Models.Page.findAllByParent(p('parent'));
    } else {
      pages = Models.Page.find({all: true});
    }
    res.die('application/json', pages);
  });

  app('/admin/page/:id', function(p) {
    res.die('application/json', Models.Page.find(p('id')));
  });

});
