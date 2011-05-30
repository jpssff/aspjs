/**
 * System Level Configuration. This function
 * should return an object of key/value pairs that
 * serves as default if not overridden elsewhere.
 *
 */
if (!this.lib_syscfg) this.lib_syscfg = lib_syscfg;
function lib_syscfg() {
  return {
    
    //Email Relay
    smtp: {
      host: 'localhost',
      port: '25'
    },
    
    //Defaults
    defaults:{
      //Character Encoding
      //  used when reading/writing text files on filesystem
      //  not related to text sent over HTTP (always UTF-8)
      charset: 'UTF-8'
    },
    
    //Upload Settings
    upload: {
      //Max File Size in KB
      max_size: 102400 //=100MB
    },
    
    //Document Store
    docstore: {
      numeric_id: true
    },
    
    //File Store
    filestore: {
      location: '~/data/files',
      database: 'filestore'
    },
    
    //Templating Engine
    template: {
      engine: 'nitro',
      defaults: {
        filter: 'html',
        ext: 'html',
        date_format: '{yyyy}/{mm}/{dd} {HH}:{nn}'
      }
    },
    
    //Template for HTML Redirect
    html_redir:[
      '<html>',
      '<head><title>Redirecting ...</title><meta http-equiv="refresh" content="0;url={=html redir}"></head>',
      '<body onload="location.replace(unescape(\'{=escape redir}\'))">',
      '<noscript><p>If you are not redirected, <a href="{=html redir}">Click Here</a> to continue.</p></noscript>',
      '</body>',
      String.repeat('<' + '!-- padding to prevent IE and Chrome friendly error --' + '>\n',10),
      '</html>'
    ].join('\n'),
    
    //Default 404 Response
    res_404: {
      type: 'text/html',
      body: [
        '<html>',
        '<head><title>404 Not Found</title></head>',
        '<body><h1>404 Not Found</h1><p>The requested resource was not found.</p></body>',
        String.repeat('<' + '!-- padding to prevent IE and Chrome friendly error --' + '>\n',10),
        '</html>'
      ].join('\n')
    }
    
  };
}
