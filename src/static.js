(function ($) {
	if ($.version !== '@@version') return;

	/**
	 * Empty function
	 */
	$.noop = function(){};

	/**
	 * Waits for the DOM to be accessible and then executes the callback.
	 * @param {function} callback - The function to execute once ready.
	 */
	$.ready = function (callback) {
		function onready(){
			try { callback.call(window, $); }
			catch(err) { console.error(err); }
		}
		if ($.browser.ltEqIE10 ? document.readyState === "complete" : document.readyState !== "loading") onready();
		else document.addEventListener('DOMContentLoaded', onready, false);
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
	 * @param {(number|string)} indexOrKey - The index or property key of the current item.
	 * @param {*} value - The current item's value.
	 * @this window
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
		if ($.is.hash(target)) {
			for (var name in target) {
				if (!target.hasOwnProperty(name)) continue;
				result = callback.call(window, name, target[name]);
				if ($.is.boolean(result) && result === false) break;
			}
		} else if ($.is.array(target) || $.is.self(target) || $.is.arrayLike(target)) {
			for (var i = 0, len = target.length; i < len; i++) {
				result = callback.call(window, i, target[i]);
				if ($.is.boolean(result) && result === false) break;
			}
		}
	};

	/**
	 * @callback filterCallback
	 * @param {(number|string)} indexOrKey - The index or property key of the current item.
	 * @param {*} value - The current item's value.
	 * @returns {boolean}
	 * @this window
	 */
	/**
	 * Reduce the items or properties of the supplied target to those that match the callback's test.
	 * @param {(Array|object)} target - The array or object to iterate over.
	 * @param {filterCallback} callback - The function that is used to test each value.
	 * @returns {(Array|object)}
	 */
	$.filter = function(target, callback){
		var result;
		if ($.is.hash(target)){
			result = {};
			$.each(target, function(name, value){
				if (callback.call(window, name, value) === true) result[name] = value;
			});
		} else if ($.is.array(target) || $.is.self(target) || $.is.arrayLike(target)){
			result = [];
			$.each(target, function(i, item){
				if (callback.call(window, i, item) === true) result.push(item);
			});
		}
		return result;
	};

	/**
	 * @callback mapCallback
	 * @param {*} value - The current item's value.
	 * @param {(number|string)} indexOrKey - The index or property key of the current value.
	 * @returns {*}
	 * @this window
	 */
	/**
	 * Translate all items in an array or object to new array of items.
	 * @param {(Array|object)} target - The array or object to iterate over.
	 * @param {mapCallback} callback - The function to process each item against.
	 * @returns {Array}
	 */
	$.map = function(target, callback){
		var result = [], tmp;
		$.each(target, function(indexOrKey, value){
			tmp = callback.call(window, value, indexOrKey);
			if ($.is.defined(tmp) && tmp !== null){
				if ($.is.array(tmp)) result = result.concat(tmp);
				else result.push(tmp);
			}
		});
		return result;
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
		touchEvent = /^touch/,
		transitionEvent = /^transition/,
		animationEvent = /^animation/;

	/**
	 * Given the name of an event, such as click or submit, this returns the type of Event object that should be instantiated.
	 * @param {string} name - The name of the event.
	 * @returns {string}
	 */
	$.getEventType = function(name){
		return (mouseEvent.test(name)
				? 'Mouse' : (keyEvent.test(name)
					? 'Keyboard' : (touchEvent.test(name)
						? 'Touch' : ($.browser.supports('transition') && transitionEvent.test(name)
							? 'Transition' : ($.browser.supports('animation') && animationEvent.test(name)
								? 'Animation' : ''))))) + 'Event'
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
	 * Search for a specified value within an array and return its index (or -1 if not found).
	 * @param {*} value - The value to search for.
	 * @param {Array} array - An array through which to search.
	 * @returns {number}
	 */
	$.inArray = function(value, array){
		var result = -1;
		$.each(array, function(i, item){
			if (item === value){
				result = i;
				return false;
			}
		});
		return result;
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
		while ((child = child.parentNode) && child !== parent) {}
		return !!child;
	};

	/**
	 * Get an integer indicating the position of the supplied element within it's parent element relative to its sibling elements.
	 * @returns {number}
	 */
	$.index = function(element){
		var k = 0, e = element;
		while (e = e.previousElementSibling) { ++k; }
		return k;
	};

	var elem = document.createElement('div');
	/**
	 * Parses a string into a NodeList.
	 * @param {string} htmlString - The HTML string to be parsed.
	 * @returns {(NodeList|null)}
	 */
	$.parseHTML = function(htmlString){
		if (!$.is.html(htmlString)) return null;
		elem.innerHTML = htmlString;
		return elem.childNodes;
	};

})(FooJitsu);