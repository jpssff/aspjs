/* >>>>>>>>>> BEGIN bundle_info.js */
        ;(function() {
          var target_name = 'sproutcore/standard_theme' ;
          if (!SC.BUNDLE_INFO) throw "SC.BUNDLE_INFO is not defined!" ;
          if (SC.BUNDLE_INFO[target_name]) return ; 

          SC.BUNDLE_INFO[target_name] = {
            requires: ['sproutcore/empty_theme','sproutcore/debug','sproutcore/testing'],
            styles:   ['/static/sproutcore/standard_theme/en/current/stylesheet.css?1287123524'],
            scripts:  []
          }
        })();

/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ==========================================================================
// Project:   TestRunner Strings
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals TestRunner */

// Place strings you want to localize here.  In your app, use the key and
// localize it using "key string".loc().  HINT: For your key names, use the
// english string with an underscore in front.  This way you can still see
// how your UI will look and you'll notice right away when something needs a
// localized string added to this file!
//
SC.stringsFor('English', {
  "Kind.app": "Apps",
  "Kind.framework" : "Frameworks",
  "Kind.sproutcore" : "SproutCore",
  
  "_Test Runner" : "Test Runner",
  "_No Targets" : "No Targets",
  "_No Tests" : "No Tests",
  "_Loading Targets" : "Loading Targets",
  "_No Target Selected" : "No Target Selected",
  "_Loading Tests" : "Loading Tests",
  "_Window Title" : "Test Runner - %@",
  "_No Target" : "No Target"
}) ;

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals CoreTools TestRunner */

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Application
*/
TestRunner = SC.Application.create(
  /** @scope TestRunner.prototype */ {

  NAMESPACE: 'TestRunner',
  VERSION: '0.1.0',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  store: SC.Store.create().from('CoreTools.DataSource'),
  
  /** Returns all known targets */
  targets: function() {
    return this.get('store').find(CoreTools.TARGETS_QUERY);
  }.property().cacheable(),
  
  trace: NO,
  
  userDefaults: SC.UserDefaults.create({
    userDomain: 'anonymous',
    appDomain:  'SC.TestRunner'
  }),
  
  // ..........................................................
  // ROUTE SUPPORT
  // 
  
  /**
    The current route.  This is set whenever the route changes.
  */
  route: {},
  
  /**
    Whenever the route changes and it does not match the current state,
    this will be set to YES.  Whenever states transition, if the route is
    pending, they will try to move it on to the next step if possible.
  */
  routePending: NO,
  
  /**
    Computes the current target as named by the route.  If the target is not
    found it will return null.  
  */
  computeRouteTarget: function() {
    var name = this.get('route').target;
    if (!name) return null;
    else return TestRunner.targetsController.findProperty('name', name);    
  },
  
  /**
    Computes the current test as named by the route.  If the test is not found
    it will return null.
  */
  computeRouteTest: function() {
    var name = this.get('route').test;
    if (!name) return null;
    else return TestRunner.testsController.findProperty('filename', name);
  },
  
  /**
    Called whenever the route changes.  Sends an appropriate event down the
    responder chain.  Also sets the current target.
  */
  routeDidChange: function(params) {
    if (!params.target) return NO; // nothing to do
    
    // normalize target + test
    params = SC.clone(params);
    if (params.target) params.target = '/' + params.target;
    if (params.test) params.test   = 'tests/' + params.test ;
    
    // save the desired state properties
    this.set('route', params);
    this.set('routePending', YES);
    
    this.trace = YES;
    this.sendAction('route', this, params);
    this.trace=NO;

    return YES;
  },
  
  /**
    Called by the state machine whenever it lands in a stable target state.
    Pass in the target and test.  We'll update the location and set a new 
    target route state if needed.
    
    Whenever you update the route to the current route state, then 
    routePending will be cleared.
    
    Passing isFinal will force the routePending to go to NO.  pass this when
    the state is at a dead-end and can't move forward any further.
  */
  updateRoute: function(target, test, isFinal) {
    var route = this.get('route'),
        loc;
    
    if (isFinal || ((target === route.target) && (test === route.test))) {
      this.set('routePending', NO);
    }

    // if a route is not pending, then update the current location with the
    // new route
    if (!this.get('routePending')) {
      if (target) target = target.get('name');
      if (test)   test = test.get('filename');

      loc = target ? target.slice(1) : '';
      if (test) loc = '%@&test=%@'.fmt(loc, test.slice(6));

      SC.routes.setIfChanged('location', loc);
    }    
  }
  
}) ;

// Add a route handler to select a target and, optionally, a test.
SC.routes.add('*target', TestRunner, TestRunner.routeDidChange);

/* >>>>>>>>>> BEGIN source/controllers/detail.js */
// ==========================================================================
// Project:   TestRunner.detailController
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  The currently selected test in detail view.

  @extends SC.ObjectController
*/
TestRunner.detailController = SC.ObjectController.create(
/** @scope TestRunner.detailController.prototype */ {
  
  /**
    Adds a random number onto the end of the URL to force the iframe to 
    reload.
  */
  uncachedUrl: function() {
    var url = this.get('url');
    return url ? [url, Date.now()].join('?') : url ;
  }.property('url')
  
}) ;

/* >>>>>>>>>> BEGIN source/controllers/source.js */
// ==========================================================================
// Project:   TestRunner.sourceController
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Exposed the flattened list of targets for the source list.  Computed from 
  the root node generated on the targetsController.  Configure for display of
  the source list.

  @extends SC.TreeController
*/
TestRunner.sourceController = SC.TreeController.create(
/** @scope TestRunner.sourceController.prototype */ {

  contentBinding: 'TestRunner.targetsController.sourceRoot',
  treeItemChildrenKey: "children",
  treeItemIsExpandedKey: "isExpanded",
  treeItemIsGrouped: YES,
  
  allowsMultipleSelection: NO,
  allowsEmptySelection: NO,
  
  // used to set the thickness of the sidebar.  bound here.
  sidebarThickness: 200  // set default thickness in pixels
 
}) ;

/* >>>>>>>>>> BEGIN source/controllers/target.js */
// ==========================================================================
// Project:   TestRunner.targetController
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  The currently selected target.  Used by the testsController to get the 
  tests of the target.  May be used by other parts of the app to control the
  selected target.

  @extends SC.ObjectController
*/
TestRunner.targetController = SC.ObjectController.create(
/** @scope TestRunner.targetController.prototype */ {

  contentBinding: 'TestRunner.sourceController.selection',
  
  nameDidChange: function() {
    var name = this.get('name');
    if (name) name = name.slice(1);
    document.title = "_Window Title".loc(name || '_No Target'.loc());  
  }.observes('name')
  
}) ;

/* >>>>>>>>>> BEGIN source/controllers/targets.js */
// ==========================================================================
// Project:   TestRunner.targetsController
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  The full set of targets available in the application.  This is populated 
  automatically when you call loadTargets().

  @extends SC.ArrayController
*/
TestRunner.targetsController = SC.ArrayController.create(
/** @scope TestRunner.targetsController.prototype */ {

  /**
    Call this method whenever you want to relaod the targets from the server.
  */
  reload: function() {
    var targets = TestRunner.store.find(CoreTools.TARGETS_QUERY);
    this.set('content', targets);
  },
  
  /** 
    Generates the root array of children objects whenever the target content
    changes.  Used in a tree node.
  */
  sourceRoot: function() {
    
    // break targets into their respective types.  Items that should not be 
    // visible at the top level will not have a sort kind
    var kinds = {}, keys = [], kind, targets, ret;
    
    this.forEach(function(target) { 
      if (kind = target.get('sortKind')) {
        targets = kinds[kind];
        if (!targets) kinds[kind] = targets = [];
        targets.push(target);
        if (keys.indexOf(kind) < 0) keys.push(kind);
      }
    }, this);

    // sort kinds alphabetically - with sproutcore at end and apps at top
    keys.sort();
    if (keys.indexOf('sproutcore') >= 0) {
      keys.removeObject('sproutcore').pushObject('sproutcore');      
    }
    if (keys.indexOf('apps') >= 0) {
      keys.removeObject('apps').unshiftObject('apps');
    }
    
    // once divided into kinds, create group nodes for each kind
    ret = [];
    keys.forEach(function(kind) {
      targets = kinds[kind];
      
      var defKey = "SourceList.%@.isExpanded".fmt(kind),
          expanded = TestRunner.userDefaults.get(defKey);
      
      ret.push(SC.Object.create({
        displayName: "Kind.%@".fmt(kind).loc(),
        isExpanded: SC.none(expanded) ? (kind !== 'sproutcore') : expanded,
        children: targets.sortProperty('kind', 'displayName'),
        
        isExpandedDefaultKey: defKey,
        isExpandedDidChange: function() {
          TestRunner.userDefaults.set(this.get('isExpandedDefaultKey'), this.get('isExpanded'));
        }.observes('isExpanded')
      }));
    });
    
    return SC.Object.create({ children: ret, isExpanded: YES });
    
  }.property('[]').cacheable(),
  
  /**
    Send event when targets load.
  */
  statusDidChange: function() {
    TestRunner.sendAction('targetsDidChange');
  }.observes('status')

}) ;

TestRunner.targetsController.addProbe('state');

/* >>>>>>>>>> BEGIN source/controllers/tests.js */
// ==========================================================================
// Project:   TestRunner.testsController
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Manages the list of tests for the currently focused target.

  @extends SC.ArrayController
*/
TestRunner.testsController = SC.ArrayController.create(
/** @scope TestRunner.testsController.prototype */ {

  contentBinding: "TestRunner.targetController.tests",
  
  /**
    Enables/disables continuous integration mode.
  */
  useContinuousIntegration: NO,
  
  /**
    Whenever we are actually showing the tests, then controls are enabled.
    Set to YES when in READY_LIST mode.
  */
  isShowingTests: YES,
  
  statusDidChange: function() {
    TestRunner.sendAction('testsDidChange');
  }.observes('status')
  
}) ;

/* >>>>>>>>>> BEGIN source/states/no_targets.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/**
  Displayed when the app has no targets.
*/
TestRunner.NO_TARGETS = SC.Responder.create({
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'noTargets');
    TestRunner.updateRoute(null, null, YES);
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  }
    
});

/* >>>>>>>>>> BEGIN source/states/ready.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/**
  Initial state of application before it has loaded targets.
*/
TestRunner.READY = SC.Responder.create({
  
  /**
    Invoked when you select a target.  Set the target controller then show 
    list state if needed.
  */
  selectTarget: function(sender, target) {
    if (target && target.isEnumerable) target = target.firstObject();

    TestRunner.sourceController.selectObject(target);
    
    if (target) {
      var tests = target.get('tests');
      if (tests && (tests.get('status') & SC.Record.BUSY)) {
        TestRunner.makeFirstResponder(TestRunner.READY_LOADING);
      } else if (!tests || (tests.get('length')===0)) {
        TestRunner.makeFirstResponder(TestRunner.READY_NO_TESTS);
      } else TestRunner.makeFirstResponder(TestRunner.READY_LIST);
      
    } else TestRunner.makeFirstResponder(TestRunner.READY_EMPTY);
  },

  /**
    Invoked when you select the test.
  */
  selectTest: function(sender, test) {
    if (!TestRunner.targetController.get('hasContent')) return NO ;

    if (test && test.isEnumerable) test = test.firstObject();
    TestRunner.detailController.set('content', test);
    TestRunner.set('routeName', test ? test.get('filename') : null);

    if (test) TestRunner.makeFirstResponder(TestRunner.READY_DETAIL);
    else TestRunner.makeFirstResponder(TestRunner.READY_LIST);
  },
  
  route: function(sender, params) {
    var target = TestRunner.computeRouteTarget(),
        test   = TestRunner.computeRouteTest();

    if (test) TestRunner.sendAction('selectTest', this, test);
    else TestRunner.sendAction('selectTarget', this, target);
  }
      
});

/* >>>>>>>>>> BEGIN source/states/ready_detail.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  Initial state of application before it has loaded targets.
*/
TestRunner.READY_DETAIL = SC.Responder.create({
  
  nextResponder: TestRunner.READY,
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'testsDetail');
    
    var target = TestRunner.sourceController.get('selection').firstObject();
    var test   = TestRunner.detailController.get('content');
    TestRunner.updateRoute(target, test, YES);
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  },
  
  /**
    Invoked when you click "back"
  */
  back: function() {
    TestRunner.detailController.set('content', null);
    TestRunner.makeFirstResponder(TestRunner.READY_LIST);
  }
  
});

/* >>>>>>>>>> BEGIN source/states/ready_empty.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  State when targets are loaded, but no target is selected.
*/
TestRunner.READY_EMPTY = SC.Responder.create({

  nextResponder: TestRunner.READY,
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'testsNone');

    // if a route is pending, then try to select the target.  If no target
    // could be found, then set the final route to here.
    TestRunner.updateRoute(null, null, NO);
     
    if (TestRunner.get('routePending')) {
      var target = TestRunner.computeRouteTarget();
      if (target) TestRunner.sendAction('selectTarget', this, target);
      else TestRunner.updateRoute(null, null, YES) ;
    } 
    
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  },
  
  /**
    While in the empty state, save the target/test and then. 
  */
  route: function(sender, params) {
    TestRunner.set('routeTarget', params.target);
    TestRunner.set('routeTest', params.test);
  }
  
});

/* >>>>>>>>>> BEGIN source/states/ready_list.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  Initial state of application before it has loaded targets.
*/
TestRunner.READY_LIST = SC.Responder.create({
  
  nextResponder: TestRunner.READY,
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'testsMaster');
    TestRunner.testsController.set('selection', null); // always empty sel
    //TestRunner.testsController.set('isShowingTests', YES);

    var target = TestRunner.sourceController.get('selection').firstObject();
    TestRunner.updateRoute(target, null, NO);
    if (TestRunner.get('routePending')) {
      var test = TestRunner.computeRouteTest();
      if (test) TestRunner.sendAction('selectTest', this, test);
      else TestRunner.updateRoute(target, null, YES);
    } 
    
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
    //TestRunner.testsController.set('isShowingTests', NO);
  }
  
});

/* >>>>>>>>>> BEGIN source/states/ready_loading.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  Show loading indicator.
*/
TestRunner.READY_LOADING = SC.Responder.create({

  nextResponder: TestRunner.READY,
  
  /**
    Show loading tests view after 100msec
  */
  didBecomeFirstResponder: function() {
    this._timer = this.invokeLater(this._showTestsLoading, 150);
  },
  
  _showTestsLoading: function() {
    this._timer = null ;
    TestRunner.set('currentScene', 'testsLoading');
  },
  
  willLoseFirstResponder: function() {
    if (this._timer) this._timer.invalidate();
    TestRunner.set('currentScene', null);
  },
  
  testsDidChange: function(sender) {
    var tests = TestRunner.testsController;
    if (!(tests.get('status') & SC.Record.READY)) return NO ;
    
    if (tests.get('length')===0) {
      TestRunner.makeFirstResponder(TestRunner.READY_NO_TESTS);
    } else TestRunner.makeFirstResponder(TestRunner.READY_LIST);
  }
  
});

/* >>>>>>>>>> BEGIN source/states/ready_no_tests.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/**
  Displayed when the app has no targets.
*/
TestRunner.READY_NO_TESTS = SC.Responder.create({
  
  nextResponder: TestRunner.READY,
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'noTests');

    // this is always the final route since we can't load any tests
    var target = TestRunner.sourceController.get('selection').firstObject();
    TestRunner.updateRoute(target, null, YES);
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  }
    
});

/* >>>>>>>>>> BEGIN source/states/start.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/**
  Initial state of application before it has loaded targets.
*/
TestRunner.START = SC.Responder.create({
  
  /**
    Show loading targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'targetsLoading');
    TestRunner.targetsController.reload(); // load the targets.
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  },
  
  /**
    Called when the targets have loaded.  Pass param whether we have targets 
    or not.
  */
  targetsDidChange: function() {
    if (TestRunner.getPath('targets.status') !== SC.Record.READY_CLEAN) return NO;
    
    var hasTargets = TestRunner.getPath('targets.length') >0;
    if (hasTargets) TestRunner.makeFirstResponder(TestRunner.READY_EMPTY);
    else TestRunner.makeFirstResponder(TestRunner.NO_TARGETS);
    return YES;
  }
    
});

/* >>>>>>>>>> BEGIN source/views/offset_checkbox.js */
// ==========================================================================
// Project:   TestRunner.OffsetCheckboxView
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  This special view class will automatically adjusts its left offset based 
  on an "offset" value, which is will be bound to the width of the split view.
  
  This way when you resize the split view, the checkbox view will move also.

  @extends SC.CheckboxView
*/
TestRunner.OffsetCheckboxView = SC.CheckboxView.extend(
/** @scope TestRunner.OffsetCheckboxView.prototype */ {

  /** bind to thickness of splitview (though a controller) */
  offset: 0,
  
  offsetDidChange: function() {
    this.adjust('left', this.get('offset')+6);
  }.observes('offset')

});

/* >>>>>>>>>> BEGIN source/lproj/main_page.js */
// ==========================================================================
// Project:   SproutCore Test Runner
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('views/offset_checkbox');

// This page describes the main user interface for your application.  
TestRunner.mainPage = SC.Page.design({

  /**
    This is the main pane that is displayed when the application loads.  The
    main views are configured here including the sidebar, toolbar at the 
    bottom and the iframe.
  */
  mainPane: SC.MainPane.design({

    defaultResponder: "TestRunner",
    
    // when defining a generic view, just name the properties holding your
    // child views here.  the w() helper is like calling split(' ')
    childViews: 'splitView toolbarView'.w(),
    
    // This is the main split view on the top of the screen.  Note that 
    // since SC.SplitView defines a few special types of views you don't need
    // to define a childViews array.
    splitView: SC.SplitView.design({
      
      layout: { left: 0, top: 0, right: 0, bottom: 32 },
      
      defaultThickness: 200,
      topLeftThicknessBinding: "TestRunner.sourceController.sidebarThickness",
      
      topLeftView: SC.ScrollView.design({
        
        hasHorizontalScroller: NO, // disable horizontal scrolling
        contentView: SC.SourceListView.design({
          contentBinding: "TestRunner.sourceController.arrangedObjects",
          selectionBinding: "TestRunner.sourceController.selection",
          contentValueKey: "displayName",
          hasContentIcon: YES,
          contentIconKey:  "targetIcon",
          
          action: 'selectTarget'
        })
      }),
      
      bottomRightView: SC.SceneView.design({
        scenes: "testsMaster testsDetail".w(),
        nowShowingBinding: "TestRunner.currentScene"
      })
    }),
    
    // This is the toolbar view that appears at the bottom.  We include two
    // child views that alight right and left so that we can add buttons to 
    // them and let them layout themselves.
    toolbarView: SC.ToolbarView.design({

      anchorLocation: SC.ANCHOR_BOTTOM,

      childViews: 'logo continuousIntegrationCheckbox runTestsButton'.w(),
      classNames: 'bottom-toolbar',

      logo: SC.View.design({
        layout: { left: 0, top: 0, bottom: 0, width: 200 },
        classNames: 'app-title',
        tagName: 'h1',
        render: function(context, firstTime) {
          var img_url = '/static/sproutcore/foundation/en/current/images/sproutcore-logo.png?1287123523';
          context.push('<img src="%@" />'.fmt(img_url));
          context.push('<span>', "_Test Runner".loc(), "</span>");
        }
      }),

      continuousIntegrationCheckbox: TestRunner.OffsetCheckboxView.design({
        title: "Continuous Integration",
        offsetBinding: "TestRunner.sourceController.sidebarThickness",
        valueBinding: "TestRunner.testsController.useContinuousIntegration",
        isEnabledBinding: "TestRunner.testsController.isShowingTests",
        layout: { height: 18, centerY: 1, width: 170, left: 206 }
      }),
      
      runTestsButton: SC.ButtonView.design({
        title: "Run Tests",
        isEnabledBinding: "TestRunner.testsController.isShowingTests",
        layout: { height: 24, centerY: 0, width: 90, right: 12 }
      })
      
      
    })
  }),

  targetsLoading: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      controlSize: SC.HUGE_CONTROL_SIZE,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_Loading Targets".loc()
    })
  }),

  noTargets: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_No Targets".loc()
    })
  }),

  noTests: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_No Tests".loc()
    })
  }),
  
  testsLoading: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_Loading Tests".loc()
    })
  }),

  testsNone: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_No Target Selected".loc()
    })
  }),
  
  /* list view:  displayed when you are in the READY_LIST state, this view 
     shows all of the unit tests for the selected target.
  */
  testsMaster: SC.ScrollView.design({
    
    // configure scroll view do hide horizontal scroller
    hasHorizontalScroller: NO,
    
    // this is the list view that actually shows the content
    contentView: SC.ListView.design({
      
      // bind to the testsController, which is an ArrayController managing the
      // tests for the currently selected target.
      contentBinding: "TestRunner.testsController.arrangedObjects",
      selectionBinding: "TestRunner.testsController.selection",
      
      // configure the display options for the item itself.  The row height is
      // larger to make this look more like a menu.  Also by default show
      // the title.
      classNames: ['test-list'], // used by CSS
      rowHeight: 32,

      hasContentIcon: YES,
      contentIconKey: "icon",

      hasContentBranch: YES,
      contentIsBranchKey: 'isRunnable',

      contentValueKey: "displayName",

      // the following two options will make the collection view act like a 
      // menu.  It will send the action down the responder chain whenever you
      // click on an item.  When in the READY state, this action will show the
      // detail view.
      actOnSelect: YES,
      action: "selectTest"
      
    })
  }),
  
  testsDetail: SC.View.design({
    childViews: "navigationView webView".w(),

    navigationView: SC.ToolbarView.design({
      classNames: 'navigation-bar',
      
      layout: { top: 0, left: 0, right: 0, height: 32 },
      childViews: "backButton locationLabel".w(),
      
      backButton: SC.ButtonView.design({
        layout: { left: 8, centerY: 0, width: 80, height: 24 },
        title: "« Tests",
        action: "back"
      }),
      
      locationLabel: SC.LabelView.design({
        layout: { right: 8, centerY: -2, height: 16, left: 100 },
        textAlign: SC.ALIGN_RIGHT,
        valueBinding: "TestRunner.detailController.displayName"
      })
      
    }),
    
    webView: SC.WebView.design({
      layout: { top: 33, left: 2, right: 0, bottom: 0 },
      valueBinding: SC.Binding.oneWay("TestRunner.detailController.uncachedUrl")
    })
  })  

});



/* >>>>>>>>>> BEGIN source/main.js */
// ==========================================================================
// Project:   TestRunner
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals TestRunner */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
TestRunner.main = function main() {
  
  // setup views
  TestRunner.getPath('mainPage.mainPane').append() ;

  TestRunner.makeFirstResponder(TestRunner.START);

  // load initial data
  //var targets = TestRunner.store.findAll(CoreTools.Target);
  //TestRunner.targetsController.set('content', targets);

} ;

function main() { TestRunner.main(); }

