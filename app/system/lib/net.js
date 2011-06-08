if (!this.lib_net) this.lib_net = lib_net;
function lib_net() {
  var util = lib('util');
  return {
    /**
     * HTTP Client Request
     * Request a remote resource using HTTP
     *
     */
    httpRequest: function(req) {
      if (vartype(req) == 'string') {
        req = {url: req};
      }
      var xhr = new ActiveXObject("Msxml2.ServerXMLHTTP");
      if (String(req.type).toUpperCase() == 'POST') {
        req.type = 'POST';
        req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        req.type = 'GET';
      }
      xhr.open(req.type, req.url, false);
      forEach(req.headers, function(n, val) {
        xhr.setRequestHeader(n, val);
      });
      for (var i = 0; i < 3; i++) {
        var res = {};
        try {
          if (req.type == 'POST' && req.data) {
            xhr.send(util.buildQueryString(req.data));
          } else {
            xhr.send();
          }
        } catch(e) {
          res.error = e.description;
          sys.log('Error Requesting: ' + req.url + '', 'Error: ' + res.error, 'err-httpreq');
        }
        if (!res.error) {
          res.status = String.parse(xhr.status).w()[0];
          res.headers = new Collection(util.parseHeaders(xhr.getAllResponseHeaders()));
          //TODO: Detect Text Encoding (Charset)
          res.ctype = (res.headers('Content-Type')) ? res.headers('Content-Type').split(';')[0] : 'application/octet-stream';
          res.body = new Binary(xhr.responseBody);
          //res.toString = res.body.toString.bind(res.body);
          res.toString = function() {
            return this.body.toString.apply(this.body, arguments);
          };
          break;
        }
      }
      return res;
    },
    /**
     * Construct and Send an Email using SMTP
     * SMTP relay must be specified in application config
     *
     */
    sendEmail: function(o) {
      var e = new ActiveXObject('CDO.Message'), s = 'http://schemas.microsoft.com/cdo/configuration/';
      e.configuration.fields(s + 'sendusing') = 2;
      e.configuration.fields(s + 'smtpserver') = app.cfg('smtp/host');
      e.configuration.fields(s + 'smtpserverport') = app.cfg('smtp/port');
      if (app.cfg('smtp/user') && app.cfg('smtp/pass')) {
        e.configuration.fields(s + 'smtpauthenticate') = 1;
        e.configuration.fields(s + 'sendusername') = app.cfg('smtp/user');
        e.configuration.fields(s + 'sendpassword') = app.cfg('smtp/pass');
      }
      e.configuration.fields.update();
      e.to = o.to;
      e.from = o.from || 'local@localhost';
      if (o.replyto) e.replyto = o.replyto;
      e.subject = o.subject;
      if (o.body_text) e.textbody = o.body_text;
      if (o.body_html) e.htmlbody = o.body_html;
      try {
        e.send();
      } catch (e) {
        var err = e.number + '; ' + e.description;
        sys.log('Error Sending Email: ', o, 'Error: ' + err, 'err-email');
        throw new Error('Error Sending Email: ' + err);
      }
      sys.log('Email Sent Successfully: ', o, 'sys-email');
    }
  };
}