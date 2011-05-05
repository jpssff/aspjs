@Echo Off
:start
echo.
cscript //nologo jscript\handler.wsf {`url`:`/`,`method`:`GET`,`headers`:{`host`:`winnt:3000`},`cookies`:{},`ipaddr`:`192.168.67.1`,`server`:`Node`}
::v8cgi\v8cgi -c v8cgi\v8cgi.conf v8cgi\scripts\handler.js {`url`:`/`,`method`:`GET`,`headers`:{`host`:`winnt:3000`},`cookies`:{},`ipaddr`:`192.168.67.1`,`server`:`Node`}
echo.
pause
goto start
