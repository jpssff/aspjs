// ==========================================================================
// Project:   Admin.appController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Admin */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Admin.appController = SC.ObjectController.create(
/** @scope Admin.appController.prototype */ {

  greeting: "Hello World!",
	
	//doSomething: function() {
	//	var curVal = this.get('greeting');
	//	var newVal = (curVal === 'Text Value Two!') ? 'Text Value One!' : 'Text Value Two!' ;
	//	this.set('greeting', newVal);
	//},
	
	isClockShowing: NO,
	
	//isClockShowingObserver: function() {
	//	if (window.console) console.log(arguments);
	//	var isClockShowing = this.get('isClockShowing') ;
	//	var newVal = (isClockShowing) ? 'CLOCK!' : 'Hello World!' ;
	//	this.set('greeting', newVal) ;
	//}.observes('isClockShowing'),
	
	isClockShowingObserver: function() {
		if (window.console) console.log(arguments);
		var isClockShowing = this.get('isClockShowing') ;
		
		// create a timer if it does not exist already
		if (!this._timer){
			this._timer = SC.Timer.schedule({
				target: this,
				action: 'tick',
				repeats: YES,
				interval: 1000
			});
		}
		
		// pause the timer unless the clock is showing
		this._timer.set('isPaused', !isClockShowing);
		
		// update right now
		var newVal = (isClockShowing) ? this.now() : 'Hello World';
		this.set('greeting', newVal);
	}.observes('isClockShowing'),

	
	tick: function() { 
		this.set('greeting', this.now()) ;
	},  
	now: function() { 
		return new Date().format('hh:mm:ss'); 
	}


}) ;
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('admin');