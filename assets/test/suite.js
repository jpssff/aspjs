jQuery(function($) {

  var tests = [];
  tests.push({
    name: 'Request URL Parsing',
    url: '/test/url-params/A0B1C2/uñíçôdë/123'
  });
  tests.push({
    name: 'Request QueryString Params',
    url: '/test/url-qs',
    params: 'hex=A0B1C2&word=' + escape('uñíçôdë') + '&number=123',
    _params: {hex: 'A0B1C2', word: 'uñíçôdë', number: 123}
  });
  tests.push({
    name: 'Request Post Data',
    url: '/test/url-post/tést',
    params: 'timestamp=' + escape(new Date().toString()),
    method: 'post',
    data: 'hex=A0B1C2&word=' + escape('uñíçôdë') + '&number=123'
  });

  $('.test-name a').live('click', function() {
    var $a = $(this), $tr = $a.closest('tr').next();
    if ($tr.hasClass('response')) {
      $tr.toggleClass('hidden');
    }
    return false;
  });

  var $tbl = $.tmpl($('#tbl-tests').html(), {tests: tests});
  $('#content-pane').append($tbl);
  $tbl.find('tr:odd').addClass('alt');

  nextTest(0);

  function nextTest(i) {
    if (i >= tests.length) return;
    var test = tests[i], $tr = $tbl.find('#row-' + i);
    $tr.addClass('in-progress');
    doTest(test, function(success, message, response) {
      $tr.removeClass('in-progress');
      var $div = $('<pre class="response-text"/>').text(response);
      $tr.after($('<tr class="response hidden"/>').append($('<td colspan="3"/>').append($div)));
      if (success) {
        $tr.addClass('success').find('.result').attr('title',  'Success');
        nextTest(++i);
      } else {
        $tr.addClass('failure').find('.result').attr('title',  message);
      }
    });
  }

  function doTest(test, callback) {
    var err_msg, response;
    $.ajax({
      url: test.url,
      data: test.params || {},
      success: function(data, status, xhr) {
        if (data == '{"result":"success"}') {
          callback(true, err_msg, data);
        } else {
          callback(false, 'Error getting result', data);
        }
      },
      error: function(xhr, status, ex){
        if (ex) {
          err_msg = 'Exception: ' + ex.message;
        } else {
          err_msg = 'Error getting result; HTTP Status: ' + (xhr.status || status);
          var ct = (xhr.status && xhr.getResponseHeader('content-type')) || '';
          if (xhr.status == '404') {
            response = '404; ' + test.url;
          } else {
            response = (/text\//i.exec(ct)) ? xhr.responseText : ct.replace(/\/.*$/, '');
          }
        }
        callback(false, err_msg, response);
      },
      dataType: 'text'
    });
  }

});
