(function($){
	if ($.version !== '@@version') return;

	/**
	 * @callback breakpointCallback
	 * @param {HTMLElement} el - The el the breakpoint has changed for.
	 * @param {string} name - The name of the breakpoint.
	 * @param {number} width - The width of the breakpoint.
	 * @param {*} [argN] - Any additional arguments that were supplied as part of the breakpoint value.
	 * @this HTMLElement
	 */
	/**
	 * Attach a callback to the element to be executed when the width of the viewport, parent or result of the
	 * custom function matches one of the supplied breakpoint values and is different to the current breakpoint.
	 * @param {HTMLElement} el - The element to use as the context of the callback, this is also supplied as the first argument.
	 * @param {object} options - The options for the breakpoints. This is optional and can be excluded.
	 * @param {breakpointCallback} callback - The function to be executed when a breakpoint changes.
	 * @returns {FooJitsu}
	 */
	$.breakpoint = function(el, options, callback){
		var args = Array.prototype.slice.call(arguments);
		callback = args.pop();
		if ($.is.fn(callback)){
			var o = $.extend(true, {}, $.breakpoint.defaults, $.is.hash(options) ? options : {});
			if (!$.is.array(o.points) || o.points.length === 0) o.points = Array.prototype.slice.call($.breakpoint.points);
			o.width = $.is.fn(o.width) ? o.width.bind(window, el, o) : (o.viewport ? $.viewportWidth : null);
			function onresize(){
				var timeout;
				if ($.is.number(timeout = $.cache.get(el, '__bpt__'))) clearTimeout(timeout);
				$.cache.set(el, '__bpt__', setTimeout(function(){
					var w = $.is.fn(o.width) ? o.width() : $(el).parent().width(), current = $.breakpoint.calc(o.points, w);
					if (current[0] !== $.cache.get(el, '__bp__')){
						$.cache.set(el, '__bp__', current[0]);
						callback.apply(el, [el].concat(current));
					}
				}, o.throttle));
			}
			$(window).on('resize', onresize);
			$.cache.set(el, '__bpc__', onresize);
			onresize();
		} else if (args.length === 1 && $.is.fn(callback = $.cache.get(el, '__bpc__'))){
			callback.apply(el, [el].concat(current));
		}
	};

	/**
	 * @callback breakpointWidthCallback
	 * @param {HTMLElement} el - The el the breakpoint has changed for.
	 * @param {object} options - The options for the breakpoints.
	 * @this window
	 */
	/**
	 * The defaults for the breakpoint function.
	 * @type {object}
	 * @property {boolean} viewport - Whether to use the viewport or parent width for calculations.
	 * @property {Array.<Array>} points - An array containing arrays of point values.
	 * @property {number} throttle - Specifies the delay in milliseconds after the resize event has been raised to wait to see if another is triggered.
	 * @property {breakpointWidthCallback} width - A function to retrieve a custom width used for calculations. If supplied this is the only function used to retrieve a width value.
	 */
	$.breakpoint.defaults = {
		viewport: true,
		points: [],
		throttle: 50,
		width: null
	};

	/**
	 * The default point values to use if none are supplied.
	 * @type {Array.<Array>}
	 */
	$.breakpoint.points = [
		["xs", 480],
		["sm", 768],
		["md", 1024],
		["lg", 1280],
		["xl", 1600]
	];

	/**
	 * Supplied an array of breakpoint values this returns the one matching the supplied width.
	 * @param {Array.<Array>} points - An array of breakpoint values.
	 * @param {number} width - The width to use when checking the breakpoints.
	 * @returns {Array}
	 */
	$.breakpoint.calc = function(points, width){
		if (!$.is.array(points) || !$.is.number(width)) return null;
		var i = 0, len = points.length, current;
		points.sort(function(a,b){ return a[1] - b[1]; });
		for (; i < len; i++){
			if (width <= points[i][1]){
				current = points[i];
				break;
			}
		}
		if (!current) current = points[len - 1];
		return current;
	};

	/**
	 * Removes the breakpoint callback from the supplied element.
	 * @param {HTMLElement} el - The element to remove the callback from.
	 */
	$.breakpoint.remove = function(el){
		var timeout;
		if ($.is.number(timeout = $.cache.get(el, '__bpt__'))){
			clearTimeout(timeout);
			$.cache.remove(el, '__bpt__');
		}
		var onresize;
		if ($.is.fn(onresize = $.cache.get(el, '__bpc__'))){
			$(window).off('resize', onresize);
			$.cache.remove(el, '__bpc__');
		}
		$.cache.remove(el, '__bp__');
	};

	/**
	 * Attach a callback to the matched elements to be executed when the width of the viewport, parent or result of the
	 * custom function matches one of the supplied breakpoint values and is different to the current breakpoint.
	 * @param {object} options - The options for the breakpoints. This is optional and can be excluded.
	 * @param {function} callback - The function to be executed when a breakpoint is reached.
	 * @returns {FooJitsu}
	 */
	$.prototype.breakpoint = function(options, callback){
		var args = Array.prototype.slice.call(arguments);
		return this.each(function(i, el){
			$.breakpoint.apply(window, [el].concat(args));
		});
	};

	/**
	 * Removes the breakpoint callback from the matched elements.
	 * @returns {FooJitsu}
	 */
	$.prototype.removeBreakpoint = function(){
		return this.each(function(i, el){
			$.breakpoint.remove(el);
		});
	};

})(FooJitsu);