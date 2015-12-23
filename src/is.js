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