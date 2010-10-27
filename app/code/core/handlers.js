/**
 * Process saved error reports as soon as application is ready.
 *
 */
app.on('ready',function(){
	
	//Checks for any saved errors
	appvars(/^Error_(\d+)$/i,function(n,val){
		
		//Calls the function below
		err_report(val);
		
		//Returning null removes the application variable
		return null;
		
	});
	
});

function err_report(details) {
	
	//TODO: some error reporting here
	
}
