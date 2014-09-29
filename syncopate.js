/* Definition
-------------------------------*/
var syncopate = function() {
	/* Constants
	-------------------------------*/
	/* Properties
	-------------------------------*/
	var methods = {},
		threads = {},
		stack	= [],
		args	= [],
		working	= false,
		scope	= methods;
	
	/* Public Methods
	-------------------------------*/
	/**
	 * Sets the scope for all then and thread callbacks
	 *
	 * @param object
	 * @return this
	 */
	methods.scope = function(object) {
		scope = object;
		return this;
	};
	
	/**
	 * Queues the next callback and 
	 * calls it if nothing is queued
	 *
	 * @param function
	 * @return this
	 */
	methods.then = function(callback) {
		//thread is the callback
		stack.push(callback);
		
		if(!working) {
			working = true;
			_next.apply(null, args);
		}
		
		return this;
	};
	
	/**
	 * Stores a callback for later usage
	 *
	 * @param function
	 * @return this
	 */
	methods.thread = function(name, callback) {
		threads[name] = callback;
		return this;
	};
	
	/* Private Methods
	-------------------------------*/
	var _next = function() {
		//if next was called in the callback
		//and there is no calback in the stack
		if(!stack.length) {
			//save it for now and wait for when they call then()
			working = false;
			args 	= Array.prototype.slice.apply(arguments);
			return;
		}
		
		//next was called in the callback
		//we can just shift this out
		var callback 	= stack.shift(),
			args 		= Array.prototype.slice.apply(arguments),
			next 		= arguments.callee;
		
		args.push(next);
		
		//can we async it?
		if(typeof process === 'object' 
		&& typeof process.nextTick === 'function') {
			//async call
			setImmediate(function() {
				//do the callback
				callback.apply(scope, args);
			});
			
			return;
		}
		
		//do the callback
		callback.apply(scope, args);
	};
	
	_next.thread = function() {
		var args = Array.prototype.slice.apply(arguments);
		var thread = args.shift();
		
		args.push(_next);
		
		if(typeof threads[thread] === 'function') {
			//can we async it?
			if(typeof process === 'object' 
			&& typeof process.nextTick === 'function') {
				//async call
				setImmediate(function() {
					//do the callback
					threads[thread].apply(scope, args);
				});
				
				return;
			}
			
			//do the callback
			threads[thread].apply(scope, args);
		}
	};
	
	return methods;
};

/* Adaptor
-------------------------------*/
module.exports = syncopate;