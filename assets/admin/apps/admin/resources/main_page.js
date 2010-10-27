// ==========================================================================
// Project:   Admin - mainPage
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Admin */

// This page describes the main user interface for your application.  
Admin.mainPage = SC.Page.design({		

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    childViews: 'labelView checkboxView'.w(),
		classNames: ['clock'],
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, width: 300, height: 18 },
			classNames: "clock",
			valueBinding: 'Admin.appController.greeting'
    }),
		
		checkboxView: SC.CheckboxView.design({
			layout: { centerX: 0, centerY: 20, width: 250, height: 18 },
			title: "Show Clock",
			valueBinding: 'Admin.appController.isClockShowing',
		}),
		

		
  })

});
