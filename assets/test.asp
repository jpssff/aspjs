<%@LANGUAGE="JAVASCRIPT" CODEPAGE="1252"%>
<script language="javascript" runat="server">

prototypes();
Die(Array.safeArray(['a',1]) instanceof VBArray);

var obj = {'constructor':'yep','control':'yep','hasOwnProperty':'yep','isPrototypeOf':'yep','propertyIsEnumerable':'yep','toLocaleString':'yep','toString':'yep','valueOf':'yep'};

var col = new Collection(obj);

col('test','1');

Die(typeof Array.prototype.concat);

var a = [];
col.each(function(n,val){
	a.push('"' + n + '": "' + String(val) + '"');
});
Die(a.join('\n'));

var a = [];
for (var n in col) a.push(n + ': ' + col[n]);
Die(a.join('\n'));



function Die(s) {
	Response.Clear();
	Response.ContentType = "text/plain";
	Response.Write(String(s));
	Response.End();
}

</script>
<script language="javascript" runat="server" src="../app/core/prototypes.js"></script>
<script language="javascript" runat="server" src="../app/core/collection.js"></script>
