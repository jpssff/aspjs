register("session",function(){
	var sess_id;
	var fn_init = function(){
    var uid = '';
    for (var n = 4; n; --n) {
        uid += (Math.abs((Math.random() * 0xFFFFFFF) | 0)).toString(16).toUpperCase();
    }
    return sess_id = uid;
	};
	var sess = function(){
		var args = toArray(arguments);
		if (!sess_id) fn_init();
		if (args.length == 1) {
			return Session(String(args[0]));
		} else
		if (args.length == 2) {
			Session(String(args[0])) = args[1];
			return args[1];
		}
	};
	sess.sid = function(){
		if (!sess_id) fn_init();
		return sess_id;
	};
	sess.discard = function(){
		Session.Abandon();
	};
	return sess;
});