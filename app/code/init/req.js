/**
 * Request Processing
 *
 * NOTES: This handles the request after all other script files are
 *        loaded. It triggers the 'ready' event and then the 'complete'
 *        event and then exits. All application logic should have been
 *        bound to one of those two events by the time this script runs.
 *
 */
res.clear();
app.trigger('ready');
app.trigger('complete');
res.end();
