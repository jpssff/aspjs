<script language="javascript" runat="server">
/**
 * Handle Server Side Errors.
 *
 * NOTE: Error details are saved to an Application variable with
 *       a random ID for later post-processing and logging.
 *
 */
var e = Server.GetLastError();
var a = [];
a.push('500 Internal Error');
a.push('Date / Time: ' + new Date().toUTCString());
a.push('Category: ' + e.Category.replace(/Microsoft (\w+)Script/ig,'Script'));
a.push('Number: ' + e.Number);
a.push('Description: ' + e.Description);
if (e.ASPDescription) a.push(e.ASPDescription);
a.push('File: ' + e.File);
a.push('Line: ' + e.Line);
a.push('');

var err_id = Math.random().toString().replace('.','');
Application("Error_" + err_id) = a.join('||');

Response.Clear();
Response.Status = "500 Internal Error " + err_id;
Response.ContentType = "text/plain";
Response.Write(a.join('\r\n'));
Response.End();
</script>
