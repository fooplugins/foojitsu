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