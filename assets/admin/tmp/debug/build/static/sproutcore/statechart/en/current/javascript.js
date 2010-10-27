/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// SC Statechart - Buildfile
// copyright (c) 2009 - Evin Grano, and contributors
// ==========================================================================

// ..........................................................
// State Constants
// 

SC.DEFAULT_TREE = 'default';


/* >>>>>>>>>> BEGIN source/system/state.js */
// ==========================================================================
// SC.State
// ==========================================================================

/**
  @class
  This defines a state for use with the SC.Statechart state machine
  
  
  @author: Mike Ball
  @author: Michael Cohen
  @author: Evin Grano
  @version: 0.1
  @since: 0.1
*/
SC.State = SC.Object.extend({
  
  
  /**
    Called when the state chart is started up.  Use this method to init
    your state
    
    @returns {void}
  */
  initState: function(){},
  
  /**
    Called when this state, or one of its children is becoming the current
    state.  Do any state setup in this method
    
    @param {Object} context optional additonal context info
    @returns {void}
  */
  enterState: function(context){},
  
  /**
    Called when this state, or one of its children is losing its status as the 
    current state.  Do any state teardown in this method
    
    @param {Object} context optional additonal context info
    @returns {void}
  */
  exitState: function(context){},
  
  /**
    the parallel statechart this state is a member of.  Defaults to 'default'
    @property {String}
  */
  parallelStatechart: SC.DEFAULT_STATE,
  /**
    The parent state.  Null if none
    
    @property {String}
  */
  parentState: null,
  
  /**
   * The history state. Null if no substates
   * @property {String}
   */
  history: null,
  
  /**
    Identifies the optional substate that should be entered on the 
    statechart start up.
    if null it is assumed this state is a leaf on the response tree

    @property {String}
  */
  initialSubState: null,
  
  /**
    the name of the state.  Set by the statemanager

    @property {String}
  */
  name: null,
  
  /**
    returns the current state for the parallel statechart this state is in.
    
    use this method in your events to determin if specific behavior is needed
    
    @returns {SC.State}
  */
  state: function(){
    var sm = this.get('stateManager');
    if(!sm) throw 'Cannot access the current state because state does not have a state manager';
    return sm.currentState(this.get('parallelStatechart'));
  },
  
  /**
    transitions the current parallel statechart to the passed state
    
    
    @param {String}
    @returns {void}
  */
  goState: function(name){
    var sm = this.get('stateManager');
    if(sm){
      sm.goState(name, this.get('parallelStatechart'));
    }
    else{
      throw 'Cannot goState cause state does not have a stateManager!';
    }
  },
  
  /**
    transitions the current parallel statechart to the passed historystate
    
    
    @param {String}
    @param {Bool}
    @returns {void}
  */
  goHistoryState: function(name, isRecursive){
    var sm = this.get('stateManager');
    if(sm){
      sm.goHistoryState(name, this.get('parallelStatechart'), isRecursive);
    }
    else{
      throw 'Cannot goState cause state does not have a stateManager!';
    }
  },
  
  enterInitialSubState: function(tree) {
    var initialSubState = this.get('initialSubState');
    if (initialSubState) {
      if(!tree[initialSubState]) throw 'Cannot find initial sub state: %@ defined on state: %@'.fmt(initialSubState, this.get('name'));
      this.set('history', initialSubState);
      var subState = tree[initialSubState];
      return this.goState(initialSubState, tree);
    }
    return this;
  },
  
  /**
    pretty printing
  */
  toString: function(){
    return this.get('name');
  },
  
  /**
    returns the parent states object
    @returns {SC.State}
  */
  parentStateObject: function(){
    var sm = this.get('stateManager');
    if(sm){
      return sm.parentStateObject(this.get('parentState'), this.get('parallelStatechart'));
    }
    else{
      throw 'Cannot access parentState cause state does not have a stateManager!';
    }
  }.property('parentState').cacheable(),
  
  /**
    returns an array of parent states if any
    
    @returns {SC.Array}
    
  */
  trace: function(){
    var sm = this.get('stateManager');
    if(sm){
      return sm._parentStates(this);
    }
    else{
      throw 'Cannot trace cause state does not have a stateManager!';
    }
  }

});


/* >>>>>>>>>> BEGIN source/mixins/statechart.js */
// ==========================================================================
// SC.Statechart
// ==========================================================================
require('system/state');
/**
  @namespace
  
  A most excellent statechart implementation
  
  @author: Mike Ball
  @author: Michael Cohen
  @author: Evin Grano
  @version: 0.1
  @since: 0.1
*/

SC.Statechart = {
    
  isStatechart: true,
  
  log: NO,
  
  initMixin: function(){
    //setup data
    this._all_states = {};
    this._all_states[SC.DEFAULT_TREE] = {};
    this._current_state = {};
    this._current_state[SC.DEFAULT_TREE] = null;
    this._goStateLocked = NO;
    this._pendingStateTransitions = [];
    //alias sendAction
    this.sendAction = this.sendEvent;
    if(this.get('startOnInit')) this.startupStatechart();
  },
  
  startOnInit: YES,
  
  
  startupStatechart: function(){
    //add all unregistered states
    if(!this._started){
      var key, tree, state, trees, startStates, startState, currTree;
      for(key in this){
        if(this.hasOwnProperty(key) && SC.kindOf(this[key], SC.State) && this[key].get && !this[key].get('beenAddedToStatechart')){
          state = this[key];
          this._addState(key, state);
        }
      }
      trees = this._all_states;
      //init the statechart
      for(key in trees){  
        if(trees.hasOwnProperty(key)){
          tree = trees[key];
          //for all the states in this tree
          for(state in tree){
            if(tree.hasOwnProperty(state)){
              tree[state].initState();
            }
          }
        }
      }
      //enter the startstates
      startStates = this.get('startStates');
      if(!startStates) throw 'Please add startStates to your statechart!';
      
      for(key in trees){  
        if(trees.hasOwnProperty(key)){
          startState = startStates[key];
          currTree = trees[key];
          if(!startState) console.error('The parallel statechart %@ must have a start state!'.fmt(key));
          if(!currTree) throw 'The parallel statechart %@ does not exist!'.fmt(key);
          if(!currTree[startState]) throw 'The parallel statechart %@ doesn\'t have a start state [%@]!'.fmt(key, startState);
          this.goState(startState, key);
        }
      }
    }
    this._started = YES;
  },
  
  
  /**
    Adds a state to a state manager
    
    if the stateManager and stateName objects are blank it is assumed
    that this state will be picked up by the StateManger's init
    
    @param {Object} the state definition
    @param {SC.Object} Optional: Any SC.Object that mixes in SC.Statechart 
    @param {String} Optional: the state name
    @returns {SC.State} the state object
  */
  registerState: function(stateDefinition, stateManager, stateName){
    
    var state, tree;
    //create the state object
    state = SC.State.create(stateDefinition);
    
    //passed in optional arguments
    if(stateManager && stateName){
      if(stateManager.isStatechart){

        stateManager._addState(stateName, state);
        state.initState();
      }
      else{
        throw 'Cannot add state: %@ because state manager does not mixin SC.Statechart'.fmt(state.get('name'));
      }
    }
    else{
      state.set('beenAddedToStatechart', NO);
    }
    //push state onto list of states
    
    return state;
  },
  
  goHistoryState: function(requestedState, tree, isRecursive){
    var allStateForTree = this._all_states[tree],
        pState, realHistoryState;
    if(!tree || !allStateForTree) throw 'State requesting go history does not have a valid parallel tree';
    pState = allStateForTree[requestedState];
    if (pState) realHistoryState = pState.get('history') || pState.get('initialSubState');

    if (!realHistoryState) {
      if (!isRecursive) console.warn('Requesting History State for [%@] and it is not a parent state'.fmt(requestedState));
      realHistoryState = requestedState;
      this.goState(realHistoryState, tree);
    }
    else if (isRecursive) {
      this.goHistoryState(realHistoryState, tree, isRecursive);
    }
    else {
      this.goState(realHistoryState, tree);
    }
  },
  
  goState: function(requestedState, tree) {
    var currentState = this._current_state[tree],
        enterStates = [],
        exitStates = [],
        enterMatchIndex,
        exitMatchIndex,
        pivotState, pState, cState, 
        i, hasLogging = this.get('log'), loggingStr;
             
    if (!tree) throw '#goState: State requesting go does not have a valid parallel tree';
    
    requestedState = this._all_states[tree][requestedState];
    
    if (!requestedState) throw '#goState: Could not find the requested state!';

    if (this._goStateLocked) {
      // There is a state transition currently happening. Add this requested state
      // transition to the queue of pending state transitions. The request will
      // be invoked after the current state transition is finished.
      this._pendingStateTransitions.push({
        requestedState: requestedState,
        tree: tree
      });
      return;
    }
    
    // Lock the current state transition so that no other requested state transition 
    // interferes. 
    this._goStateLocked = YES;

    // Get the parent states for the current state and the registered state. We will
    // use them to find a common parent state. 
    enterStates = this._parentStates_with_root(requestedState);
    exitStates = currentState ? this._parentStates_with_root(currentState) : [];
  
    // Continue by finding the common parent state for the current and requested states
    //
    // At most, this takes O(m^2) time, where m is the maximum depth from the
    // root of the tree to either the requested state or the current state. 
    // Will always be less than or equal to O(n^2), where n is the number of 
    // states in the tree.
    pivotState = exitStates.find(function(item,index){
      exitMatchIndex = index;
      enterMatchIndex = enterStates.indexOf(item);
      if (enterMatchIndex >= 0) return YES;
    });
      
    // Looks like we were unable to find a common parent state. This means that we
    // must enter from the root state in the tree
    if (!enterMatchIndex) enterMatchIndex = enterStates.length - 1;
    
    // Now, from the current state, exit up the parent states to the common parent state, 
    // but don't exit the common parent itself since you are technically still in it.
    loggingStr = "";
    for (i = 0; i < exitMatchIndex; i += 1) {
      if (hasLogging) loggingStr += 'Exiting State: [%@] in [%@]\n'.fmt(exitStates[i], tree);
      exitStates[i].exitState();
    }
    
    if (hasLogging) console.info(loggingStr);
    
    // Finally, from the the common parent state, but not including the parent state, enter the 
    // sub states down to the requested state. If the requested state has an initial sub state
    // then we must enter it too.
    loggingStr = "";
    for (i = enterMatchIndex-1; i >= 0; i -= 1) {
      //TODO call initState?
      cState = enterStates[i];
      if (hasLogging) loggingStr += 'Entering State: [%@] in [%@]\n'.fmt(cState, tree);
      pState = enterStates[i+1];
      if (pState && SC.typeOf(pState) === SC.T_OBJECT) pState.set('history', cState.name);
      cState.enterState();

      if (cState === requestedState) {
        // Make sure to enter the requested state's initial sub state!
        cState.enterInitialSubState(this._all_states[tree || SC.DEFAULT_TREE]);
      }
    }
    if (hasLogging) console.info(loggingStr);
    
    // Set the current state for this state transition
    this._current_state[tree] = requestedState;
            
    // Okay. We're done with the current state transition. Make sure to unlock the
    // goState and let other pending state transitions execute.
    this._goStateLocked = NO;
    this._flushPendingStateTransition();
  },
  
  /** @private
  
    Called by goState to flush a pending state transition and the front of the 
    pending queue.
  */
  _flushPendingStateTransition: function() {
    var pending = this._pendingStateTransitions.shift();
    if (!pending) return;
    this.goState(pending.requestedState, pending.tree);
  },
  
  currentState: function(tree){
    tree = tree || SC.DEFAULT_TREE;
    return this._current_state[tree];
  },
  
  //Walk like a duck
  isResponderContext: YES,
  
  
  /**
    Sends the event to all the parallel state's current state
    and walks up the graph looking if current does not respond
    
    @param {String} action name of action
    @param {Object} sender object sending the action
    @param {Object} context optional additonal context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendEvent: function(action, sender, context) {
    var trace = this.get('log'),
        handled = NO,
        currentStates = this._current_state,
        responder;
    
    this._locked = YES;
    if (trace) {
      console.log("%@: begin action '%@' (%@, %@)".fmt(this, action, sender, context));
    }
    
    for(var tree in currentStates){
      if(currentStates.hasOwnProperty(tree)){
        handled = NO;
        
        responder = currentStates[tree];
       
        while(!handled && responder){
          if(responder.tryToPerform){
            handled = responder.tryToPerform(action, sender, context);
          }
          
          if(!handled) responder = responder.get('parentState') ? this._all_states[tree][responder.get('parentState')] : null;
        }
        
        if (trace) {
          if (!handled) console.log("%@:  action '%@' NOT HANDLED in tree %@".fmt(this,action, tree));
          else console.log("%@: action '%@' handled by %@ in tree %@".fmt(this, action, responder.get('name'), tree));
        }
      }
    }
    
    this._locked = NO ;
    
    return responder ;
  },
  
  
  
  _addState: function(name, state){
    state.set('stateManager', this);
    state.set('name', name);
    var tree = state.get('parallelStatechart') || SC.DEFAULT_TREE;
    state.setIfChanged('parallelStatechart', tree);
    
    if(!this._all_states[tree]) this._all_states[tree] = {};
    if(this._all_states[tree][name]) throw 'Trying to add state %@ to state tree %@ and it already exists'.fmt(name, tree);
    this._all_states[tree][name] = state;
    
    state.set('beenAddedToStatechart', YES);
  },
  
  
  _parentStates: function(state){
    var ret = [], curr = state;
    
    //always add the first state
    ret.push(curr);
    curr = curr.get('parentStateObject');
    
    while(curr){
      ret.push(curr);
      curr = curr.get('parentStateObject');
    }
    return ret;
  },
  
  _parentStates_with_root: function(state){
    var ret = this._parentStates(state);
    //always push the root
    ret.push('root');
    return ret;
  },
  
  parentStateObject: function(name, tree){
    if(name && tree && this._all_states[tree] && this._all_states[tree][name]){
      return this._all_states[tree][name];
    }
    return null;
  }
 };


/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/statechart');
