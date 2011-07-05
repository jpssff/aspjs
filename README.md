# About
AspJS is a server-side framework for "classic" ASP written in Javascript with an emphasis on
"separation of concerns". It is designed to abstract database access, file system operations,
request routing, sessions, templating and other server-side concepts into modular, intuitive
Javascript interfaces.

## Features
+ Clean Code Separation
+ Module System similar to CommonJS
+ Request Routing (Sinatra-style)
+ Rich Templating Engine (based on normal-template from [Nitro](/gmosx/nitro))
+ Powerful Model layer with validation and relationships (based on ActiveRecord)
+ Event Binding
+ Persistent Session layer with namespacing and expiry options
+ Server-Side HTML Parsing, including DOM, Sizzle and jQuery
+ Helper functions for:
  - JSON
  - date parsing/manipulating/formatting
  - sending email
  - binary data
  - charset conversion

## Description
This framework focuses on separating business logic from presentation by implementing a variation of
the "Model View Controller" (MVC) architectural pattern. This is achieved using several techniques
commonly found in other web frameworks such as request routing, view templates, object-relational
mapping, modular libraries, event listeners, etc.

This framework takes inspiration from, and in some cases shares code with, other server-side
Javascript frameworks such as [v8cgi] (http://code.google.com/p/v8cgi/), [Jaxer](http://jaxer.org/),
[Connect] (http://senchalabs.github.com/connect/) and even client-side libraries like [jQuery]
(http://jquery.com/) and [Underscore](http://documentcloud.github.com/underscore/).

# Introduction
Applications consist primarily of request handler functions which are defined inside controllers.
Request handlers are attached to the application (request router) once the "ready" event fires
(indicating the framework has loaded) as follows:

```javascript
bind('ready', function() {
  //YOUR CODE HERE
});
```

Within the "ready" event handler, request routes are defined as follows:

```javascript
app('/', function() {
  res.die('text/html', '<p>Hello World</p>');
});
```

Here, "res" is the response object and res.die() is shorthand for:

```javascript
res.clear('text/html');
res.write('<p>Hello World</p>');
res.end();
```

Similarly, app('/', function() {...}) presents a shortcut for adding routes, rather than:

```javascript
req.router.addRoute('GET', '/', function() {
  ...
});
```

Named parameters are available via a passed-in accessor like so:

```javascript
app('/user/:name', function(params) {
  res.die('text/html', '<p>Hello ' + htmlEnc(params('name')) + '</p>');
});
```

The `htmlEnc()` function here is shorthand for `String.htmlEnc()` and makes your output safe for HTML.

Global shorthand functions include: `vartype`, `isPrimitive`, `isSet`, `toArray`, `forEach`,
`urlEnc`, `urlDec`, `htmlEnc` and `htmlDec`

Other important global functions are: `bind` and `lib`. As you saw in the first example,
`bind` attaches an event handler and as you will see shortly, `lib` loads a module (library) similar
to `require` in other common javascript frameworks (the `lib` syntax was chosen over `require` to
avoid conflicts when adapting this framework to other platforms).

Also, the global objects `app`, `req`, `res` and `util` are available for for convenience so you
don't have to explicitly load them like:

```javascript
var app = lib('application'), req = lib('request'), res = lib('response'), util = lib('util');
```

An example of loading, the "net" library, sending an email and then responding with a 302 redirect:

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
Application code (business logic) goes in controller files in _app/controllers/_  and helper files
in _app/shared/_. Models are defined in _app/models/_. Templates go in _app/views/_ and
configuration (JSON format) goes in _app/config/config.js_.

Data files (db, uploads, logs, etc.) reside in _app/data/_ and all framework code is found in
_app/system/_.

Static assets (images, css files, etc.) to be served directly to the public go in the _/assets/_
directory.

##How it Works
URL Rewriting causes all requests that do not begin with "/assets/" to be passed to /dispatch.asp
which looks at the _app/routes.js_ file to determine which controller should handle the request.

The dispatch script then calls a controller "stub" in the _app/build/_ directory which loads all the
framework and application code and then fires the "ready" event.

If the expected controller stub does not exist in _app/build/_ then dispatch will attempt to
create it based on files inside _app/controllers/_ and certain _inc.xml files.

##Read More

See more code examples in the [Wiki] (/sstur/aspjs/wiki/Home).
