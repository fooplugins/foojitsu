(function($){
	if ($.version !== '@@version') return;

	var prefixes = ['Webkit', 'Moz', 'ms', 'O', 'Khtml'],
		check = ['transition','transform','transformOrigin','userSelect'],
		elem = document.createElement('div'),
		cssReg = /^-(moz|webkit|khtml|o|ms)-([a-z])/,
		jsReg = /^(Moz|Webkit|Khtml|O|ms)([A-Z])/,
		regexReplacer = function(match, $1, $2){ return $2.toLowerCase(); },
		cssTextReplacer = function(match, $1, $2){ return '-'+$1+'-'+$2.toLowerCase(); },
		cleanName = function(name){
			if (cssReg.test(name)) name = name.replace(cssReg, regexReplacer);
			if (jsReg.test(name)) name = name.replace(jsReg, regexReplacer);
			return $.toCamelCase(name);
		};

	function supports(name){
		if ($.is.defined(elem.style[name])) return true;
		for (var i = 0, len = prefixes.length; i < len; i++){
			var n = prefixes[i] + name.charAt(0).toUpperCase() + name.substr(1);
			if ($.is.defined(elem.style[n])) return true;
		}
		return false;
	}

	function prefixed(name){
		if ($.inArray(name, check) != -1){
			if ($.is.defined(elem.style[name])) return name;
			for (var i = 0, len = prefixes.length; i < len; i++){
				var n = prefixes[i] + name.charAt(0).toUpperCase() + name.substr(1);
				if ($.is.defined(elem.style[n])) return n;
			}
		}
		return name;
	}

	function test(props, def){
		if ($.is.hash(props)){
			for (var name in props){
				if (!props.hasOwnProperty(name)) continue;
				if ($.is.defined(elem.style[name])) return props[name];
			}
		}
		return def;
	}

	$.browser = {
		ltEqIE10: Function('/*@cc_on return true@*/')() // this works as only IE10 and below support the @cc_on syntax
	};

	var __supports__ = {
		storage: 'localStorage' in window && window['localStorage'] !== null,
		touch: 'ontouchstart' in window || navigator.msMaxTouchPoints > 0
	};

	/**
	 * Checks if the browser supports a particular feature. At present this tests the style of an element for supported CSS properties or a small list of common features such as;
	 * "storage" - Whether or not the browser supports localStorage.
	 * "touch" - Whether or not the browser supports touch events.
	 * @param {string} name - The name of the property or feature to check.
	 * @returns {boolean}
	 */
	$.browser.supports = function(name){
		name = cleanName(name);
		if ($.is.defined(__supports__[name])) return __supports__[name];
		return (__supports__[name] = supports(name));
	};

	var __name__ = {};

	/**
	 * Adds the appropriate browser prefix to the beginning of the supplied Javascript or CSS property name.
	 * @param {string} name - The name of the property to prefix.
	 * @param {boolean} [cssText] - Whether or not the name should be returned in CSS text format.
	 * @returns {string}
	 */
	$.browser.prefixed = function(name, cssText){
		name = cleanName(name);
		name = $.is.defined(__name__[name]) ? __name__[name] : (__name__[name] = prefixed(name));
		return !!cssText ? $.toHyphen(name.replace(jsReg, cssTextReplacer)) : name;
	};

	var __events__ = {
		transitionend: test({ 'transition': 'transitionend', 'OTransition': 'otransitionend', 'MozTransition': 'transitionend', 'WebkitTransition': 'webkitTransitionEnd' }),
		animationstart: test({ 'animation': 'animationstart', 'OAnimation': 'oanimationstart', 'MozAnimation': 'animationstart', 'WebkitAnimation': 'webkitAnimationStart' }),
		animationiteration: test({ 'animation': 'animationiteration', 'OAnimation': 'oanimationiteration', 'MozAnimation': 'animationiteration', 'WebkitAnimation': 'webkitAnimationIteration' }),
		animationend: test({ 'animation': 'animationend', 'OAnimation': 'oanimationend', 'MozAnimation': 'animationend', 'WebkitAnimation': 'webkitAnimationEnd' })
	};

	/**
	 * Returns the browser specific event using the supplied name.
	 * @param {string} name - The event name to check.
	 * @returns {string}
	 */
	$.browser.event = function(name){
		return $.is.defined(__events__[name]) ? __events__[name] : name;
	};

})(FooJitsu);