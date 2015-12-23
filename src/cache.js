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