(function($){

	/**
	 * Execute all handlers and behaviors attached to the matched elements for the given event type.
	 * @param {(string|Event)} event - A string containing a JavaScript event type, such as click or submit, or the actual Event object.
	 * @param {object} props - An object containing any additional properties to set on the event object.
	 * @returns {FooJitsu}
	 */
	$.prototype.trigger = function(event, props){
		if ($.is.string(event)){
			var name = $.browser.event(event), type = $.getEventType(event);
			if (!!document.createEvent) {
				event = document.createEvent(type);
				event.initEvent(name, true, true);
			} else if (!!window[type]){
				event = new window[type](name, { 'bubbles': true, 'cancelable': true });
			}
		}
		if (!$.is.event(event)) return this;
		if ($.is.hash(props)) $.extend(true, event, props);
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
		selector = null;
		data = null;

		if (args.length === 1){
			tmp = args.shift();
			selector = $.is.string(tmp) ? tmp : null;
			data = $.is.hash(tmp) ? tmp : null;
		} else if (args.length === 2) {
			selector = args.shift();
			data = args.shift();
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

	/**
	 * Attach a handler to an event for the matched elements. The handler is executed at most once per element per event type.
	 * @param {string} events - One or more space-separated event types such as "click" or "keydown".
	 * @param {?string} [selector] - A selector string to filter the descendants of the selected elements that trigger the event. If the selector is null or omitted, the event is always triggered when it reaches the selected element.
	 * @param {object} [data] - Data to be passed to the handler in event.data when an event is triggered.
	 * @param {fnEventCallback} [handler] - A function to execute when the event is triggered.
	 * @returns {FooJitsu}
	 */
	$.prototype.one = function(events, selector, data, handler){
		var self = this, callback,
			onArgs = Array.prototype.slice.call(arguments),
			offArgs = Array.prototype.slice.call(arguments);

		// get the original handler and remove it from the arguments
		handler = onArgs.pop();
		offArgs.pop();

		// remove data from off arguments
		if (offArgs.length === 2 || offArgs.length === 3){
			if ($.is.hash(offArgs[1])) offArgs.splice(1, 1);
			if ($.is.hash(offArgs[2])) offArgs.splice(2, 1);
		}
		// create new callback that self unbinds
		callback = function(e){
			self.off.apply(self, offArgs);
			handler.call(this, e);
		};
		// add the new callback to the arguments
		onArgs.push(callback);
		offArgs.push(callback);

		return this.on.apply(this, onArgs);
	};

	/**
	 * Attach an event handler to the transitionend event for the matched elements. When using this method in a browser that does not support
	 * transitions the handler is executed immediately and the event.propertyName is set to an empty string and the event.elapsedTime is set to 0 (zero).
	 * @param {object} [data] - Data to be passed to the handler in event.data when an event is triggered.
	 * @param {fnEventCallback} [handler] - A function to execute when the event is triggered.
	 * @returns {FooJitsu}
	 */
	$.prototype.transitionend = function(data, handler){
		var self = this, args = Array.prototype.slice.call(arguments);
		args.unshift('transitionend');
		this.one.apply(this, args);
		if (!$.browser.supports('transition')){
			// delay execution by a millisecond to simulate an event being executed asynchronously and allow any chained functions to execute
			setTimeout(function(){
				self.trigger('transitionend', {propertyName: '', elapsedTime: 0});
			}, 1);
		}
		return this;
	};

})(FooJitsu);