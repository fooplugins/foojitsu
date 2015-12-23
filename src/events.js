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