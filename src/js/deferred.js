(function ($) {
	if ($.version !== '@@version') return;

	/**
	 * @callback beforeStartCallback
	 * @param {Deferred} deferred - The current deferred object.
	 */
	/**
	 * A factory function that returns a chainable utility object with methods to register multiple callbacks into callback queues, invoke callback queues,
	 * and relay the success or failure state of any synchronous or asynchronous function.
	 * @param {beforeStartCallback} beforeStart - A function that is called just before the constructor returns.
	 * @returns {Deferred}
	 */
	$.Deferred = function(beforeStart){
		var deferred = new Deferred();
		if ($.is.fn(beforeStart)){
			try {
				beforeStart(deferred);
			} catch (err) {
				deferred.reject(err);
			}
		}
		return deferred;
	};

	/**
	 * A chainable utility object with methods to register multiple callbacks into callback queues, invoke callback queues,
	 * and relay the success or failure state of any synchronous or asynchronous function.
	 * @returns {Deferred}
	 * @constructor
	 */
	function Deferred(){
		if (!(this instanceof Deferred)) return new Deferred();
		this._callbacks = [];
		this._state = 'pending';
	}

	/**
	 * Used internally by the object to set it's state and execute callbacks.
	 * @param {string} type - The type to apply, can be one of the following; "resolve", "reject" or "progress"
	 * @param {Array} args - The arguments to execute any callbacks with.
	 * @private
	 */
	Deferred.prototype.__apply__ = function(type, args){
		var self = this, finalize = type === 'resolve' || type === 'reject';
		if (finalize){
			if (type === 'reject'){
				this._state = 'rejected';
				this.then = function (resolve, reject) { reject.apply(self, args); };
			}
			if (type === 'resolve'){
				this._state = 'resolved';
				this.then = function (resolve) { resolve.apply(self, args); };
			}
			this.resolve = this.reject = this.notify = function () { throw new Error("Promise already completed"); };
		}
		function execute(reg, type, args){
			var callbacks = $.is.fn(reg[type]) ? [reg[type]] : ($.is.array(reg[type]) ? reg[type] : []);
			$.each(callbacks, function(i, callback){
				if ($.is.fn(callback)) callback.apply(self, args);
			});
		}
		function safe_execute(reg, type, args){
			try { execute(reg, type, args); }
			catch (err) { execute(reg, 'reject', [err]); }
		}
		$.each(this._callbacks, function(i, reg){
			safe_execute(reg, type, args);
		});
		if (finalize){
			$.each(this._callbacks, function(i, reg){
				safe_execute(reg, 'always', args);
			});
			this._callbacks = [];
		}
	};

	/**
	 * Determine the current state of a Deferred object, can be one of the following; "pending", "resolved" or "rejected"
	 * @returns {string}
	 */
	Deferred.prototype.state = function(){
		return this._state;
	};

	/**
	 * Resolve a Deferred object and call any doneCallbacks with the given args.
	 * @param {...*} args - Any number of arguments to supply to the doneCallbacks.
	 */
	Deferred.prototype.resolve = function(args){
		this.__apply__('resolve', Array.prototype.slice.call(arguments));
	};

	/**
	 * Reject a Deferred object and call any failCallbacks with the given args.
	 * @param {...*} args - Any number of arguments to supply to the failCallbacks.
	 */
	Deferred.prototype.reject = function(args){
		this.__apply__('reject', Array.prototype.slice.call(arguments));
	};

	/**
	 * Call the progressCallbacks on a Deferred object with the given args.
	 * @param {...*} args - Any number of arguments to supply to the progressCallbacks.
	 */
	Deferred.prototype.notify = function(args){
		this.__apply__('progress', Array.prototype.slice.call(arguments));
	};

	/**
	 * @callback alwaysCallback
	 * @param {...*} [args] - Any number of arguments to supply to the alwaysCallbacks.
	 */
	/**
	 * @callback doneCallback
	 * @param {...*} [args] - Any number of arguments to supply to the doneCallbacks.
	 */
	/**
	 * @callback failCallback
	 * @param {...*} [args] - Any number of arguments to supply to the failCallbacks.
	 */
	/**
	 * @callback progressCallback
	 * @param {...*} [args] - Any number of arguments to supply to the progressCallbacks.
	 */
	/**
	 * Add handlers to be called when the Deferred object is resolved, rejected, or still in progress.
	 * @param {(doneCallback|Array.<doneCallback>)} doneCallbacks - A function, or array of functions, called when the Deferred is resolved.
	 * @param {(failCallback|Array.<failCallback>)} failCallbacks - A function, or array of functions, called when the Deferred is rejected.
	 * @param {(progressCallback|Array.<progressCallback>)} progressCallbacks - A function, or array of functions, called when the Deferred notifies progress.
	 * @returns {Deferred}
	 */
	Deferred.prototype.then = function(doneCallbacks, failCallbacks, progressCallbacks){
		this._callbacks.push({resolve: doneCallbacks, reject: failCallbacks, progress: progressCallbacks});
		return this;
	};

	/**
	 * Add handlers to be called when the Deferred object is either resolved or rejected.
	 * @param {(alwaysCallback|Array.<alwaysCallback>)} alwaysCallbacks - A function, or array of functions, that is called when the Deferred is resolved or rejected.
	 * @returns {Deferred}
	 */
	Deferred.prototype.always = function(alwaysCallbacks){
		this._callbacks.push({always: alwaysCallbacks});
		return this;
	};

	/**
	 * Add handlers to be called when the Deferred object is resolved.
	 * @param {(doneCallback|Array.<doneCallback>)} doneCallbacks - A function, or array of functions, called when the Deferred is resolved.
	 * @returns {Deferred}
	 */
	Deferred.prototype.done = function(doneCallbacks){
		this._callbacks.push({resolve: doneCallbacks});
		return this;
	};

	/**
	 * Add handlers to be called when the Deferred object is rejected.
	 * @param {(failCallback|Array.<failCallback>)} failCallbacks - A function, or array of functions, called when the Deferred is rejected.
	 * @returns {Deferred}
	 */
	Deferred.prototype.fail = function(failCallbacks){
		this._callbacks.push({reject: failCallbacks});
		return this;
	};

	/**
	 * Add handlers to be called when the Deferred object generates progress notifications.
	 * @param {(progressCallback|Array.<progressCallback>)} progressCallbacks - A function, or array of functions, to be called when the Deferred generates progress notifications.
	 * @returns {Deferred}
	 */
	Deferred.prototype.progress = function(progressCallbacks){
		this._callbacks.push({progress: progressCallbacks});
		return this;
	};

	/**
	 * Provides a way to execute callback functions based on one or more Deferred objects that represent asynchronous events.
	 * @param {...Deferred} deferreds - One or more Deferred objects.
	 * @returns {Deferred|FooJitsu.Deferred}
	 */
	$.when = function(deferreds){
		var args = Array.prototype.slice.call(arguments);
		return $.Deferred(function(d){
			var expected = args.length, results = {length: 0};
			$.each(args, function(i, deferred){
				deferred.then(function(result){
					results.length++;
					results[i] = result;
					if (results.length === expected) d.resolve($.makeArray(results));
				}, function(err){
					d.reject(err);
				});
			});
		});
	};

})(FooJitsu);