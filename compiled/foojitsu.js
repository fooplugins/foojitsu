(function(){

	function $(){
		var self = this, args = Array.prototype.slice.call(arguments);
		if (!(this instanceof $)){
			function FooJitsu(args) { return $.apply(this, args); }
			FooJitsu.prototype = $.prototype;
			return new FooJitsu(args);
		}
		this.context = $.getContext(args);
		this.length = 0;
		var arg1 = args.shift();
		if ($.is.selector(arg1)) {
			return $(this.context.querySelectorAll(arg1), this.context);
		} else if ($.is.element(arg1)) {
			this[0] = arg1;
			this.length = 1;
		} else if ($.is.array(arg1) || $.is.self(arg1) || $.is.arrayLike(arg1)) {
			$.each(arg1, function(i, value){
				if ($.is.element(value)) self[i] = value;
			});
			this.length = arg1.length;
		} else if ($.is.fn(arg1)){
			$.ready(arg1);
		}
	}

	window.FooJitsu = $;

})();
(function ($) {

	/**
	 * Empty function
	 */
	$.noop = function(){};

	/**
	 * Waits for the DOM to be accessible and then executes the callback.
	 * @param {function} callback - The function to execute once ready.
	 */
	$.ready = function (callback) {
		document.readyState === 'loading' ? setTimeout(function () { $.ready(callback); }, 9) : callback($);
	};

	/**
	 * Used by the FooJitsu constructor, when given an array of args this function returns the correct context to use.
	 * @param {Array} args - The arguments to check.
	 * @returns {Node}
	 */
	$.getContext = function(args){
		if ($.is.array(args) && args.length > 1){
			var ctx = args[args.length - 1];
			if ($.is.selector(args[0])){
				if ($.is.self(ctx) && ctx.length == 1) return ctx.get(0);
				if ($.is.element(ctx)) return ctx;
			}
		}
		return document;
	};

	/**
	 * @callback eachCallback
	 * @param {(number|string)} indexOrName - The index or name of the current item.
	 * @param {*} value - The current item's value.
	 * @this *
	 */
	/**
	 * A generic iterator function, which can be used to seamlessly iterate over both objects and arrays.
	 * Arrays and array-like objects with a length property (such as a function's arguments object) are
	 * iterated by numeric index, from 0 to length-1. Other objects are iterated via their named properties.
	 * @param {(Array|object)} target - The array or object to iterate over.
	 * @param {(eachCallback)} callback - The function that will be executed on every value.
	 */
	$.each = function (target, callback) {
		var result;
		if ($.is.array(target) || $.is.self(target) || $.is.arrayLike(target)) {
			for (var i = 0, len = target.length; i < len; i++) {
				result = callback.call(target[i], i, target[i]);
				if ($.is.boolean(result) && result === false) break;
			}
		} else if ($.is.hash(target)) {
			for (var name in target) {
				if (!target.hasOwnProperty(name)) continue;
				result = callback.call(target[name], name, target[name]);
				if ($.is.boolean(result) && result === false) break;
			}
		}
	};

	/**
	 * Merge the contents of two or more objects together into the first object.
	 * @param {(object|boolean)} deepOrTarget - Whether to perform a deep copy or the target object to receive additional properties.
	 * @param {object} targetOrObject1 - Either the target object to receive additional properties or an object containing additional properties to merge in.
	 * @param {...object} [objectN] - Additional objects containing properties to merge in.
	 * @returns {object}
	 */
	$.extend = function (deepOrTarget, targetOrObject1, objectN) {
		var args = Array.prototype.slice.call(arguments),
			target = args.shift(), deep = false, src, clone;

		if ($.is.boolean(target)){
			deep = target;
			target = args.shift() || {};
		}

		$.each(args, function(i, obj){
			if (!$.is.hash(obj) && !$.is.array(obj)) return;
			$.each(obj, function(name, value){
				src = target[name];
				if (target === value) return;
				if (deep && $.is.array(value)){
					clone = $.is.array(src) ? src : [];
					target[name] = $.extend(deep, clone, value);
				} else if (deep && $.is.hash(value)){
					clone = $.is.hash(src) ? src : {};
					target[name] = $.extend(deep, clone, value);
				} else if ($.is.defined(value)) {
					target[name] = value;
				}
			});
		});
		return target;
	};

	var mouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		keyEvent = /^key/,
		touchEvent = /^touch/;

	/**
	 * Given the name of an event, such as click or submit, this returns the type of Event object that should be instantiated.
	 * @param {string} name - The name of the event.
	 * @returns {string}
	 */
	$.getEventType = function(name){
		return (mouseEvent.test(name) ? 'Mouse' : (keyEvent.test(name) ? 'Keyboard' : (touchEvent.test(name) ? 'Touch' : ''))) + 'Event'
	};

	/**
	 * Remove the whitespace from the beginning and end of a string and optional replace multiple spaces with a single space.
	 * @param {string} str - The string to trim.
	 * @param {boolean} [replaceMultiple=false] - Whether or not to replace multiple spaces with a single space.
	 * @returns {string}
	 */
	$.trim = function (str, replaceMultiple) {
		if ($.is.undef(str) || str == null) return '';
		if (!!replaceMultiple) str = str.replace(/[\s\uFEFF\xA0]{2,}/g, ' ');
		return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};

	/**
	 * Convert an array-like object into a true JavaScript array.
	 * @param {object} arrayLike - The object to create an array from.
	 * @returns {Array}
	 */
	$.makeArray = function (arrayLike) {
		var array = [];
		if ($.is.arrayLike(arrayLike)) {
			for (var i = 0, len = arrayLike.length, tmp; i < len; i++) {
				tmp = arrayLike[i];
				if ($.is.defined(tmp)) array.push(tmp);
			}
		}
		return array;
	};

	/**
	 * Splits a string into an array using the separator and removes empty values from the result.
	 * @param {string} str - The string to split.
	 * @param {string} [separator= ] - The separator to use to split the string. Defaults to a single space ( ).
	 * @param {boolean} [removeEmpty=true] - Whether or not to remove empty values from the final result. Defaults to true.
	 * @param {boolean} [trimResults=true] - Whether or not to trim the values in the final result. Defaults to true.
	 * @returns {Array.<string>}
	 */
	$.split = function(str, separator, removeEmpty, trimResults){
		if (!$.is.string(str)) return [];
		separator = $.is.defined(separator) ? separator : ' ';
		removeEmpty = $.is.boolean(removeEmpty) ? removeEmpty : true;
		trimResults = $.is.boolean(trimResults) ? trimResults : true;
		var result = str.split(separator);
		for (var i = result.length; i >= 0; i--){
			if (trimResults) result[i] = $.trim(result[i]);
			if (removeEmpty && result[i] === '') result.splice(i, 1);
		}
		return result;
	};

	/**
	 * Parses an attributes value into either a string, boolean, number or JSON value.
	 * @param {(string|boolean|number)} val - The attribute's string value.
	 * @returns {(string|boolean|number|object)}
	 */
	$.parseAttrValue = function(val){
		var result = val;
		if (/^false$/i.test(val)) result = false;
		else if (/^true$/i.test(val)) result = true;
		else if (!isNaN(val)) result = +val;
		else if ($.is.string(val) && ((val.charAt(0) == '{' && val.charAt(val.length - 1) == '}') || (val.charAt(0) == '[' && val.charAt(val.length - 1) == ']'))) result = JSON.parse(val);
		return result;
	};

	/**
	 * Converts the supplied string to a camel cased variant both trimming the string and replacing multiple spaces.
	 * @param {string} str - The string to convert.
	 * @returns {string}
	 */
	$.toCamelCase = function (str) {
		return $.trim(str, true).replace(/^([A-Z])|[-\s_](\w)/g, function (match, p1, p2) {
			if (p2) return p2.toUpperCase();
			return p1.toLowerCase();
		});
	};

	/**
	 * Converts the supplied string to a hyphen cased variant both trimming the string and replacing multiple spaces.
	 * @param {string} str - The string to convert.
	 * @returns {string}
	 */
	$.toHyphen = function (str) {
		return $.trim(str, true).replace(/([a-z])(?:[-\s_])([A-Za-z])|([a-z])([A-Z])/g, '$1$3-$2$4').toLowerCase();
	};

	/**
	 * Checks if the first element is a child of the second.
	 * @param {Node} child - The child element to check.
	 * @param {Node} parent - The parent element to check within.
	 * @returns {boolean}
	 */
	$.isChildOf = function(child, parent){
		while ((child = child.parentNode) && child !== parent);
		return !!child;
	};

})(FooJitsu);
(function($){
	/**
	 * The namespace used to house common IS checks.
	 * @namespace
	 */
	$.is = {};

	/**
	 * Checks if the supplied object is an instance of a FooPlugins object.
	 * @param {*} obj - The object to check.
	 * @returns {boolean}
	 */
	$.is.self = function(obj){
		return $.is.defined(obj) && obj instanceof $;
	};

	/**
	 * Checks if the value is defined.
	 * @param {*} value - The value to check is defined.
	 * @returns {boolean}
	 */
	$.is.defined = function (value) {
		return typeof value !== 'undefined';
	};

	/**
	 * Checks if the value is defined.
	 * @param {*} value - The value to check is defined.
	 * @returns {boolean}
	 */
	$.is.undef = function (value) {
		return typeof value === 'undefined';
	};

	/**
	 * Checks if the value is a string.
	 * @param {*} value - The value to check is a string.
	 * @returns {boolean}
	 */
	$.is.string = function (value) {
		return typeof value === 'string';
	};

	/**
	 * Checks if the value is a number.
	 * @param {*} value - The value to check is a number.
	 * @returns {boolean}
	 */
	$.is.number = function (value) {
		return typeof value === 'number' && !isNaN(value);
	};

	/**
	 * Checks if the value is an array.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	$.is.array = function (value) {
		return '[object Array]' === Object.prototype.toString.call(value);
	};

	/**
	 * Checks if the value is an array like value.
	 * @param {object} obj - The value to check.
	 * @returns {boolean}
	 */
	$.is.arrayLike = function(obj){
		return !$.is.fn(obj) && $.is.defined(obj) && obj !== null && $.is.number(obj.length);
	};

	/**
	 * Checks if the value is a boolean.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	$.is.boolean = function (value) {
		return '[object Boolean]' === Object.prototype.toString.call(value);
	};

	/**
	 * Checks if the value is a function.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	$.is.fn = function (value) {
		var isAlert = typeof window !== 'undefined' && value === window.alert;
		return isAlert || '[object Function]' === Object.prototype.toString.call(value);
	};

	/**
	 * Checks if the value is an object.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	$.is.object = function (value) {
		return $.is.defined(value) && '[object Object]' === Object.prototype.toString.call(value);
	};

	/**
	 * Checks if the value is a hash.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	$.is.hash = function (value) {
		return $.is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
	};

	/**
	 * Checks if the supplied object is an HTMLElement
	 * @param {object} obj - The object to check.
	 * @returns {boolean}
	 */
	$.is.element = function (obj) {
		return typeof HTMLElement === 'object'
			? obj instanceof HTMLElement
			: obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string';
	};

	/**
	 * Checks if the supplied object is an Event
	 * @param {object} obj - The object to check.
	 * @returns {boolean}
	 */
	$.is.event = function (obj) {
		return $.is.defined(window.Event) && obj instanceof window.Event;
	};

	/**
	 * Checks if the supplied string is a CSS selector.
	 * @param {string} str - The string to check.
	 * @returns {boolean}
	 */
	$.is.selector = function (str) {
		try {
			if (!$.is.string(str)) return false;
			document.querySelector(str);
			return true;
		} catch (e) {
			return false;
		}
	};

	/**
	 * Checks if the supplied string contains HTML and should be interpreted as an HTMLString.
	 * @param {string} str - The string to check.
	 * @returns {boolean}
	 * @description This is an exceedingly simplified check for an HTML string, a far more reliable check can be performed by switching the Regex to the following:
	 * /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i
	 */
	$.is.html = function (str) {
		try {
			return /^<.*?>$/i.test(str);
		} catch (e) {
			return false;
		}
	};

	/**
	 * Checks if the supplied value is a member or value depending on if the target is an object or an array.
	 * @param {*} value - The value to check for.
	 * @param {*} target - Either the object or array to check.
	 * @returns {boolean}
	 */
	$.is.any = function (value, target) {
		if ($.is.array(target)) {
			var l = target.length + 1;
			while (l -= 1) if (target[l - 1] === value) return true;
		} else if ($.is.object(target)) {
			return value in target;
		}
		return false;
	};

})(FooJitsu);
(function ($) {

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
		function __exec__(reg, type){
			if ($.is.fn(reg[type])){
				reg[type].apply(self, args);
			} else if ($.is.array(reg[type])){
				$.each(reg[type], function(i, reg){
					if ($.is.fn(reg[type])) reg[type].apply(self, args);
				});
			}
		}
		$.each(this._callbacks, function(i, reg){
			__exec__(reg, type);
		});
		if (finalize){
			$.each(this._callbacks, function(i, reg){
				__exec__(reg, 'always');
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
(function($){

	var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
		elem = document.createElement('div');

	function test(nameOrHash, style){
		var test = !!style ? elem.style : elem;
		if ($.is.string(nameOrHash)){
			nameOrHash = nameOrHash.charAt(0).toUpperCase() + nameOrHash.substr(1);
			for (var i = 0, l = prefixes.length; i < l; i++) {
				if ($.is.string(test[prefixes[i] + nameOrHash])) return true;
			}
			return false;
		}
		if ($.is.hash(nameOrHash)){
			for (var name in nameOrHash) {
				if (!nameOrHash.hasOwnProperty(name)) continue;
				if ($.is.defined(test[name])) return nameOrHash[name];
			}
			return null;
		}
	}

	$.browser = {};

	$.browser.storage = (function(w){
		return 'localStorage' in w && w['localStorage'] !== null;
	})(window);

	$.browser.touch = (function(w){
		return 'ontouchstart' in w;
	})(window);

	$.browser.transitions = test('transition', true);

	$.browser._events = {
		"transitionend": test({
			'transition': 'transitionend',
			'OTransition': 'otransitionend',
			'MozTransition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd'
		}, true)
	};

	$.browser.event = function(name){
		return $.is.string($.browser._events[name]) ? $.browser._events[name] : name;
	};

	$.browser._css = {
		"transform": test({
			'transform': 'transform',
			'msTransform': 'msTransform',
			'OTransform': 'OTransform',
			'MozTransform': 'MozTransform',
			'WebkitTransform': 'WebkitTransform'
		}, true)
	};

	$.browser.css = function(name){
		return $.is.string($.browser._css[name]) ? $.browser._css[name] : name;
	};

})(FooJitsu);
(function($){

	/**
	 * The expando property name used by this instance of FooJitsu.
	 * @type {string}
	 */
	$.expando = 'foojitsu-'+Math.random().toString(36).substring(7);

	/**
	 * This class is to make working with per element data storage simple.
	 * @returns {FooJitsu.CacheManager}
	 * @constructor
	 */
	$.CacheManager = function(){
		if (!(this instanceof $.CacheManager)) return new $.CacheManager();
		/**
		 * An object used to store cached data.
		 * @type {object}
		 */
		this.data = {};
		/**
		 * An object used to store whether an id has had it's attributes parsed.
		 * @type {object}
		 * @private
		 */
		this._attr = {};
		/**
		 * An object used to store event data.
		 * @type {object}
		 * @private
		 */
		this._events = {};
	};

	/**
	 * Gets the cache ID for the supplied element, optionally caching any data attributes if not previously done so.
	 * @param {HTMLElement} el - The element to retrieve the id for.
	 * @param {boolean} [cacheAttributes=false] - Whether or not to cache the element's data attributes.
	 * @returns {number}
	 */
	$.CacheManager.prototype.uid = function(el, cacheAttributes){
		cacheAttributes = !!cacheAttributes;
		var id;
		if ($.is.element(el)){
			if (!$.is.number(id = el[$.expando])){
				id = new Date().getTime();
				Object.defineProperty(el, $.expando, { value: id, configurable: true });
			}
			if (cacheAttributes && !this._attr[id]){
				var attributes = {};
				$.each(el.attributes, function(i, attr){
					if (attr.name.substr(0, 5) === 'data-'){
						attributes[$.toCamelCase(attr.name.substr(5))] = $.parseAttrValue(attr.value);
					}
				});
				this.data[id] = $.extend(true, this.data[id], attributes);
				this._attr[id] = true;
			}
		}
		return id;
	};

	/**
	 * Clears all stored data, or only the stored data for the supplied element.
	 * @param {HTMLElement} [el] - The element to remove all data for.
	 * @param {(boolean|string)} [reset] - A boolean value indicating whether or not clear the flag indicating that the attributes have been stored,
	 * or the string value "__events__" to remove all stored event data.
	 */
	$.CacheManager.prototype.clear = function(el, reset){
		var id, hasId = $.is.number(id = this.uid(el));
		if (hasId && $.is.hash(this.data[id])){
			delete this.data[id];
		}
		if (hasId && reset){
			if ($.is.boolean(reset)) delete this._attr[id];
			if ($.is.string(reset) && reset === '__events__') delete this._events[id];
		}
		if ($.is.undef(el)){
			this.data = {};
			this._attr = {};
		}
	};

	/**
	 * Get the value at the named data store for the supplied element.
	 * @param {HTMLElement} el - The element to retrieve data for.
	 * @param {string} key - A string naming the piece of data to get, use "__events__" to retrieve all stored event data.
	 * @returns {*}
	 */
	$.CacheManager.prototype.get = function(el, key){
		var id;
		return $.is.number(id = this.uid(el, true)) && $.is.hash(this.data[id])
			? ($.is.string(key)
				? (key === '__events__'
					? ($.is.array(this._events[id])
						? this._events[id]
						: (this._events[id] = []))
					: this.data[id][key])
				: this.data[id])
			: undefined;
	};

	/**
	 * Store arbitrary data associated with the element.
	 * @param {HTMLElement} el - The element to set data for.
	 * @param {(string|object)} keyOrObj - A string naming the piece of data to set or an object of key-value pairs of data to update, use the key "__events__" to store event data.
	 * @param {*} [value] - The new data value; this can be any Javascript type except undefined.
	 */
	$.CacheManager.prototype.set = function(el, keyOrObj, value){
		var id = this.uid(el, true), obj = {}, merge = false;
		if ($.is.hash(keyOrObj)){
			obj = keyOrObj;
			merge = true;
		}
		else if ($.is.string(keyOrObj) && $.is.defined(value)){
			if (keyOrObj === '__events__' && $.is.array(value)){
				if (value.length === 0) delete this._events[id];
				else this._events[id] = value;
			} else {
				obj[keyOrObj] = value;
				merge = true;
			}
		}
		if (merge) this.data[id] = $.extend(true, this.data[id], obj);
	};

	$.cache = new $.CacheManager();

})(FooJitsu);
(function ($) {

	/**
	 * @callback fnEachCallback
	 * @param {number} index - The index of the current element.
	 * @param {HTMLElement} element - The current element.
	 * @this HTMLElement
	 */
	/**
	 * Iterate over a FooJitsu object, executing a function for each matched element.
	 * @param {fnEachCallback} callback - The function to execute for each element.
	 * @returns {FooJitsu}
	 */
	$.prototype.each = function (callback) {
		$.each(this, callback);
		return this;
	};

	/**
	 * Retrieve the DOM elements matched by the FooJitsu object. If an index is supplied
	 * retrieve one of the elements matched by the FooJitsu object.
	 * @param {number} [index] - The index of the element to retrieve. You can specify -1 to retrieve the last element.
	 * @returns {(HTMLElement|null|Array.<HTMLElement>)}
	 */
	$.prototype.get = function (index) {
		if ($.is.number(index)){
			if (index === -1) index = this.length - 1;
			return (index in this) ? this[index] : null;
		}
		var elements = [];
		this.each(function(i, el){
			elements.push(el);
		});
		return elements;
	};

	/**
	 * Check the current matched set of elements against a selector and return true if at least one of these elements matches the given arguments.
	 * @param {string} selector - The CSS selector to use to test the matched elements.
	 * @returns {boolean}
	 */
	$.prototype.is = function (selector) {
		var p = selector.split(','), result = false;
		this.each(function (i, el) {
			$.each(p, function (j, s) {
				var root = $.is.element(el.parentNode) ? el.parentNode.cloneNode(false) : document.createElement('div'),
					clone = el.cloneNode(true);
				root.appendChild(clone);
				if (root.querySelector(s) === clone) {
					result = true;
					return false;
				}
			});
			if (result === true) return false;
		});
		return result;
	};

	/**
	 * Get the descendants of each element in the current set of matched elements, filtered by a selector.
	 * @param {string} selector - The selector to filter the descendants by.
	 * @returns {FooJitsu}
	 */
	$.prototype.find = function (selector) {
		return $.is.selector(selector) ? $(selector, this) : this;
	};

	/**
	 * @callback fnFilterCallback
	 * @param {number} index - The index of the current element.
	 * @param {HTMLElement} element - The current element.
	 * @return {boolean}
	 * @this HTMLElement
	 */
	/**
	 * Reduce the set of matched elements to those that match the selector or pass the function's test.
	 * @param {(string|fnFilterCallback)} selectorOrCallback - The selector or function to filter the matched elements by, returning true in the function will include the element.
	 * @returns {FooJitsu}
	 */
	$.prototype.filter = function (selectorOrCallback) {
		var filtered = [],
			isFN = $.is.fn(selectorOrCallback),
			isSEL = $.is.selector(selectorOrCallback),
			filter = function(i, el){
				if (isFN) return selectorOrCallback.call(el, i, el);
				else if (isSEL) return $(el).is(selectorOrCallback);
				else return true;
			};
		this.each(function (i, el) {
			if (filter(i, el)) filtered.push(el);
		});
		return $(filtered, this);
	};

	/**
	 * Reduce the set of matched elements to the one at the specified index.
	 * @param {number} index - An integer indicating the 0-based position of the element.
	 * @returns {FooJitsu}
	 */
	$.prototype.eq = function (index) {
		return $(this.get(index));
	};

	/**
	 * Reduce the set of matched elements to the first in the set.
	 * @returns {FooJitsu}
	 */
	$.prototype.first = function () {
		return this.eq(0);
	};

	/**
	 * Determine whether any of the matched elements are assigned the given class(es).
	 * @param {string} className - One or more space-separated classes to check against the class attribute of each matched element.
	 * @returns {boolean}
	 */
	$.prototype.hasClass = function (className) {
		var self = this, result = false, regex;
		$.each($.split(className), function (i, klass) {
			if (!!document.classList){
				self.each(function(i, el){
					if (el.classList.contains(klass)){
						result = true;
						return false;
					}
				});
			} else {
				regex = new RegExp('(\\s|^)' + klass + '(\\s|$)');
				self.each(function(i, el){
					if (regex.test(el.className)) {
						result = true;
						return false;
					}
				});
			}
			if (result === true) return false;
		});
		return result;
	};

	/**
	 * Adds the specified class(es) to each element in the set of matched elements.
	 * @param {string} className - One or more space-separated classes to be added to the class attribute of each matched element.
	 * @returns {FooJitsu}
	 */
	$.prototype.addClass = function (className) {
		var self = this, regex;
		$.each($.split(className), function (i, klass) {
			if (!!document.classList){
				self.each(function(i, el){
					el.classList.add(klass);
				});
			} else {
				regex = new RegExp('(\\s|^)' + klass + '(\\s|$)');
				self.each(function(i, el){
					if (!regex.test(el.className)) {
						el.className = $.trim(el.className + ' ' + klass, true);
					}
				});
			}
		});
		return this;
	};

	/**
	 * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
	 * @param {string} [className] - One or more space-separated classes to be removed from the class attribute of each matched element.
	 * @returns {FooJitsu}
	 */
	$.prototype.removeClass = function (className) {
		var self = this, classNames = $.split(className), regex;
		if (classNames.length > 0){
			$.each(classNames, function (i, klass) {
				if (!!document.classList){
					self.each(function(i, el){
						el.classList.remove(klass);
					});
				} else {
					regex = new RegExp('(\\s|^)' + klass + '(\\s|$)');
					self.each(function(i, el){
						if (regex.test(el.className)) {
							el.className = $.trim(el.className.replace(regex, ' '), true);
						}
					});
				}
			});
		} else {
			this.each(function(i, el){ el.className = ''; });
		}
		return this;
	};

	/**
	 * Add or remove one or more classes from each element in the set of matched elements, depending on either the class's presence or the value of the state argument.
	 * @param {string} className - One or more space-separated classes to be toggled on each matched element.
	 * @param {boolean} [state] - Whether the class(es) should be added or removed.
	 * @returns {FooJitsu}
	 */
	$.prototype.toggleClass = function (className, state) {
		var self = this, regex, hasClass;
		$.each($.split(className), function (i, klass) {
			if (!!document.classList){
				self.each(function(i, el){
					el.classList.toggle(klass, state);
				});
			} else {
				regex = new RegExp('(\\s|^)' + klass + '(\\s|$)');
				self.each(function(i, el){
					hasClass = regex.test(el.className);
					if (($.is.boolean(state) && !state) || ($.is.undef(state) && hasClass)) {
						el.className = $.trim(el.className.replace(regex, ' '), true);
					} else if (!hasClass) {
						el.className = $.trim(el.className + ' ' + klass, true);
					}
				});
			}
		});
		return this;
	};

	/**
	 * Get an integer indicating the position of the first element within the FooJitsu object relative to its sibling elements.
	 * @returns {number}
	 */
	$.prototype.index = function(){
		var k = 0, e = this.get(0);
		while (e = e.previousSibling) { if (e.nodeType === 1) ++k; }
		return k;
	};

	/**
	 * Get the value of a computed style property for the first element in the set of matched elements or set one or more CSS properties for every matched element.
	 * @param {(string|object)} nameOrProps - A CSS property name or an object of property-value pairs to set.
	 * @param {(string|number)} value - A value to set for the property.
	 * @param {string} [priority] - A string that specifies the priority of the style.
	 * @returns {(string|FooJitsu)}
	 */
	$.prototype.css = function (nameOrProps, value, priority) {
		// get
		if ($.is.string(nameOrProps) && $.is.undef(value)){
			return getComputedStyle(this.get(0), null).getPropertyValue($.browser.css($.toHyphen(nameOrProps)));
		}
		// set OR remove
		if ($.is.hash(nameOrProps) && value === 'important'){
			priority = value;
			value = '';
		}
		if (!$.is.string(priority)) priority = '';
		function _set(el, name, value){
			name = $.browser.css($.toHyphen(name));
			if ($.is.number(value)) value = value+'px';
			if (value === '' || value === null) el.style.removeProperty(name);
			else el.style.setProperty(name, value, priority);
		}
		return this.each(function(i, el){
			if ($.is.hash(nameOrProps)){
				$.each(nameOrProps, function(name, val){
					_set(el, name, val);
				});
			} else if ($.is.string(nameOrProps)) {
				_set(el, nameOrProps, value);
			}
		});
	};

	/**
	 * Get the value of an attribute for the first element in the set of matched elements or set one or more attributes for every matched element.
	 * @param {(string|object)} nameOrAttr - An attribute name or an object of attribute-value pairs to set.
	 * @param {string} [value] - The value to set for the attribute.
	 * @returns {(string|number|boolean|object|FooJitsu)}
	 */
	$.prototype.attr = function(nameOrAttr, value){
		// get
		if ($.is.undef(value) && (nameOrAttr === null || $.is.undef(nameOrAttr) || $.is.string(nameOrAttr))){
			var el = this.get(0);
			if (!el.hasAttributes()) return;
			if ($.is.string(nameOrAttr)){
				return $.parseAttrValue(el.getAttribute($.toHyphen(nameOrAttr)));
			} else {
				var result = {};
				$.each(el.attributes, function(i, attr){
					result[$.toCamelCase(attr.name)] = $.parseAttrValue(attr.value);
				});
				return result;
			}
		}
		// set OR remove
		function _set(el, name, value){
			if (value === '' || value === null) el.removeAttribute($.toHyphen(name));
			else el.setAttribute($.toHyphen(name), $.is.string(value) ? value : JSON.stringify(value));
		}
		return this.each(function(i, el){
			if ($.is.hash(nameOrAttr)){
				$.each(nameOrAttr, function(name, val){
					_set(el, name, val);
				});
			} else if ($.is.string(nameOrAttr) && $.is.defined(value)){
				_set(el, nameOrAttr, value);
			}
		});
	};

	/**
	 * Store arbitrary data associated with the matched elements or return the value at the named data store for the first element in the set of matched elements.
	 * @param {(string|object)} keyOrObj - A string naming the piece of data to set or an object of key-value pairs of data to update.
	 * @param {*} [value] - The new data value; this can be any Javascript type except undefined.
	 * @returns {*}
	 */
	$.prototype.data = function(keyOrObj, value){
		if ($.is.undef(keyOrObj) || ($.is.string(keyOrObj) && $.is.undef(value))){
			return $.cache.get(this.get(0), keyOrObj);
		}
		return this.each(function(i, el){
			$.cache.set(el, keyOrObj, value);
		});
	};

	/**
	 * Waits for content (images and iframes) to load before executing the callback function.
	 * @param {function} callback - The function to execute once all content is loaded.
	 */
	$.prototype.contentLoaded = function(callback){
		var self = this, loadables = this.find('img,iframe'),
			results = 0, expected = loadables.length, retry = 0;

		$.each(loadables, function(i, loadable){
			if (loadable.complete){
				results++;
				return;
			}
			var $loadable = $(loadable).on('load error', function(e){
				$loadable.off('load error');
				results++;
			}).attr('src', loadable.src);
		});

		function check(){
			if (results < expected && retry <= 10){
				retry++;
				setTimeout(check, 200);
			}
			else callback.call(self);
		}
		check();
	};

	/**
	 * Used to get or set a CSS property value that uses pixels.
	 * @param {string} name - The CSS property name.
	 * @param {(string|number)} value - A value to set for the property.
	 * @returns {(number|FooJitsu)}
	 * @private
	 */
	$.prototype.__cssPixelProp__ = function(name, value){
		if ($.is.undef(value)){
			return parseFloat(this.css(name));
		}
		return this.css(name, value);
	};

	/**
	 * Get the current computed width for the first element in the set of matched elements or set the width of every matched element.
	 * @param {(number|string)} value - An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
	 * @returns {(number|FooJitsu)}
	 */
	$.prototype.width = function(value){
		return this.__cssPixelProp__('width', value);
	};

	/**
	 * Get the current computed height for the first element in the set of matched elements or set the height of every matched element.
	 * @param {(number|string)} value - An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
	 * @returns {(number|FooJitsu)}
	 */
	$.prototype.height = function(value){
		return this.__cssPixelProp__('height', value);
	};

	/**
	 * Get the current computed top position for the first element in the set of matched elements or set the top position of every matched element.
	 * @param {(number|string)} value - An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
	 * @returns {(number|FooJitsu)}
	 */
	$.prototype.top = function(value){
		return this.__cssPixelProp__('top', value);
	};

	/**
	 * Get the current computed bottom position for the first element in the set of matched elements or set the bottom position of every matched element.
	 * @param {(number|string)} value - An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
	 * @returns {(number|FooJitsu)}
	 */
	$.prototype.bottom = function(value){
		return this.__cssPixelProp__('bottom', value);
	};

	/**
	 * Get the current computed left position for the first element in the set of matched elements or set the left position of every matched element.
	 * @param {(number|string)} value - An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
	 * @returns {(number|FooJitsu)}
	 */
	$.prototype.left = function(value){
		return this.__cssPixelProp__('left', value);
	};

	/**
	 * Get the current computed right position for the first element in the set of matched elements or set the right position of every matched element.
	 * @param {(number|string)} value - An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
	 * @returns {(number|FooJitsu)}
	 */
	$.prototype.right = function(value){
		return this.__cssPixelProp__('right', value);
	};

})(FooJitsu);
(function($){

	/**
	 * Execute all handlers and behaviors attached to the matched elements for the given event type.
	 * @param {(string|Event)} event - A string containing a JavaScript event type, such as click or submit, or the actual Event object.
	 * @returns {FooJitsu}
	 */
	$.prototype.trigger = function(event){
		if ($.is.string(event)){
			var name = event, type = $.getEventType(name);
			if (!!document.createEvent) {
				event = document.createEvent(type);
				event.initEvent(name, true, true);
			} else if (!!window[type]){
				event = new window[type](name, { 'bubbles': true, 'cancelable': true });
			}
		}
		if (!$.is.event(event)) return this;
		return this.each(function(i, el){
			el.dispatchEvent(event);
		});
	};

	/**
	 * @callback fnEventCallback
	 * @param {Event} event - The event being raised.
	 * @this HTMLElement
	 */
	/**
	 * Attach an event handler function for one or more events to the selected elements.
	 * @param {string} events - One or more space-separated event types such as "click" or "keydown".
	 * @param {?string} [selector] - A selector string to filter the descendants of the selected elements that trigger the event. If the selector is null or omitted, the event is always triggered when it reaches the selected element.
	 * @param {object} [data] - Data to be passed to the handler in event.data when an event is triggered.
	 * @param {fnEventCallback} [handler] - A function to execute when the event is triggered.
	 * @returns {FooJitsu}
	 */
	$.prototype.on = function (events, selector, data, handler){
		var args = Array.prototype.slice.call(arguments), callback, tmp;
		events = args.shift();
		handler = args.pop();

		switch (args.length){
			case 1:
				tmp = args.shift();
				selector = $.is.string(tmp) ? tmp : null;
				data = $.is.hash(tmp) ? tmp : null;
				break;
			case 2:
				selector = args.shift();
				data = args.shift();
				break;
			default:
				selector = null;
				data = null;
				break;
		}

		if ($.is.string(selector)){
			callback = function(e){
				var found = (this === window ? document : this).querySelectorAll(selector);
				if (found.length){
					for (var i = 0, len = found.length; i < len; i++){
						if (e.target == found[i] || $.isChildOf(e.target, found[i])){
							if ($.is.hash(data)) e.data = $.extend(true, e.data, data);
							handler.call(this, e);
						}
					}
				}
			};
		} else if ($.is.hash(data)){
			callback = function(e){
				e.data = $.extend(true, e.data, data);
				handler.call(this, e);
			};
		} else {
			callback = function(e){
				handler.call(this, e);
			};
		}

		var self = this;
		$.each($.split(events), function(i, name){
			self.each(function(i, el){
				$.cache.get(el, '__events__').push({name: name, selector: selector, handler: callback, original: handler});
				el.addEventListener($.browser.event(name), callback, false);
			});
		});
		return this;
	};

	/**
	 * Remove an event handler.
	 * @param {string} events - One or more space-separated event types such as "click" or "keydown" to remove.
	 * @param {?string} [selector] - A selector which should match the one originally passed to .on() when attaching event handlers.
	 * @param {fnEventCallback} [handler] - A handler function previously attached for the event(s).
	 * @returns {FooJitsu}
	 */
	$.prototype.off = function (events, selector, handler) {
		var args = Array.prototype.slice.call(arguments);
		events = args.shift();
		handler = args.pop();
		selector = args.length === 1 ? args.shift() : null;

		var l = $.is.fn(handler), s = $.is.string(selector);

		var self = this;
		$.each($.split(events), function(i, name){
			self.each(function(x, el){
				var __events__ = $.cache.get(el, '__events__'), remove = [];
				$.each(__events__, function(i, e){
					if ((l && s && e.name === name && e.selector === selector && e.original === handler)
						|| (l && !s && e.name === name && e.original === handler)
						|| (!l && s && e.name === name && e.selector === selector)
						|| (!l && !s && e.name === name)){
						el.removeEventListener($.browser.event(name), e.handler, false);
						remove.push(i);
					}
				});
				remove.sort(function(a, b){ return b - a; });
				$.each(remove, function(i, index){
					__events__.splice(index);
				});
				$.cache.set(el, '__events__', __events__);
			});
		});
		return this;
	};

})(FooJitsu);