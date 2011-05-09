# About
AspJS is a server-side framework for "classic" ASP written in Javascript ([Microsoft JScript]
(http://www.4guysfromrolla.com/webtech/LearnMore/jscript.asp)) with an emphasis on "separation of
concerns". It is designed to abstract database access, file system operations, request routing,
sessions, templating and other server-side concepts into clean, functional Javascript interfaces.

## Features
+ Powerful Request Routing (Sinatra-style)
+ Clean Code Separation
+ No Inline Code / <% %> tags
+ CommonJS-like Modules
+ Event-based Request Processing
+ Rich Templating Engine (based on normal-template from [Nitro](/gmosx/nitro))
+ ActiveRecord (based on [Aptana's ActiveJS](/aptana/activejs))
+ Helper functions for:
  - date parsing/formatting
  - sending email
  - handling binary data
  - charset conversion

## Description
Asp-JS focuses on separating business logic from presentation (view) and achieves this in several ways
commonly found in other web frameworks (request routing, templating, event listeners,
callback functions, etc).

This framework is influenced by other server-side Javascript frameworks such as [v8cgi]
(http://code.google.com/p/v8cgi/), [Jaxer](http://jaxer.org/), [Connect]
(http://senchalabs.github.com/connect/) and client-side libraries like [jQuery](http://jquery.com/)
and [Underscore](http://documentcloud.github.com/underscore/) which should be apparant in
how such things as eventing and SQL querying are handled.

# Usage
Applications consist primarily of request handler functions which are defined inside controllers.
Request handlers are attached to the application (request router) when the "ready" event fires. This
event occurs after the framework has loaded.

An event handler is defined as follows:

```javascript
bind('ready', function() {
  //CODE HERE
});
```

Within the "ready" event handler, request processing can be defined as follows:

```javascript
req.router.addRoute('GET', '/', function() {
  res.die('<p>Hello World</p>', 'text/html');
});
```

Or, more concisely:

```javascript
app('/', function() {
  res.die('<p>Hello World</p>', 'text/html');
});
```

Named parameters are available via a passed-in accessor like so:

```javascript
app('/user/:name', function(params) {
  res.die('<p>Hello ' + htmlEnc(params('name')) + '</p>', 'text/html');
});
```


The (global) `htmlEnc()` function here is shorthand for `String.htmlEnc()` and will make your output
safe for HTML such that if the name "John&Jane" was passed in, it would be output as `John&amp;Jane`
in HTML.

Global shorthand functions include: `vartype`, `isPrimitive`, `isSet`, `toArray`, `forEach`,
`urlEnc`, `urlDec`, `htmlEnc` and `htmlDec`

Other important global functions are: `bind` and `lib`

Also, the global objects `app`, `req`, `res` and `util` are also available for for convenience so you
don't have to explicitly load them like:

```javascript
var app = lib('application'), req = lib('request'), res = lib('response'), util = lib('util');
```

An example of loading, the "net" library and calling the redirect method:

```javascript
var net = lib('net');
net.sendEmail({
  to:        'john.doe@gmail.com',
  from:      'myself@me.com',
  subject:   'Test Message',
  body_text: 'Hello. This is a test email.'
});
res.redirect('/success');
```

##Application Structure
Application code (business logic) goes in controller files in _/app/controllers/_  and helper files
in _/app/code/_. Templates go in _/app/views/_ and configuration (JSON format) goes in
_/app/config/config.js_.

Data files (db, uploads, logs, etc.) reside in /app/data/ and all framework code (besides bootstrap
code) is found in /app/system/.

Static assets (images, css files, etc.) to be served directly to the public go in the _/assets/_
directory.


