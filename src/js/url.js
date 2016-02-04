(function($){

	var a = document.createElement('a'),
		props = ['protocol','hostname','host','pathname','port','search','hash'];

	/**
	 * Create an object populated with the various components of the supplied url.
	 * @param {string} url - The url to parse.
	 * @returns {FooJitsu.Url}
	 * @constructor
	 */
	$.Url = function(url){
		if (!(this instanceof $.Url)) return new $.Url(url);
		this.hash = '';
		this.host = '';
		this.hostname = '';
		this.pathname = '';
		this.port = '';
		this.protocol = '';
		this.search = '';
		var self = this;
		Object.defineProperty(self, 'href', {
			get: function(){ return self.toString(); },
			set: function(value){ self.parse(value); }
		});
		self.href = url;
	};

	/**
	 * Parses the supplied url into it's various components.
	 * @param {string} url - The url to parse.
	 */
	$.Url.prototype.parse = function(url){
		if (!$.is.string(url)) return '';
		a.href = url === '' ? window.location.href : url;
		if (a.host == '') a.href = a.href;
		var self = this;
		$.each(props, function(i, prop){ self[prop] = a[prop]; });
		if (this.pathname.indexOf('/') !== 0) this.pathname = '/' + this.pathname;
	};

	/**
	 * Gets or sets a query string parameter value.
	 * @param {string} key - The key of the parameter to get or set.
	 * @param {*} [value] - The value to set, this will be converted to a string.
	 * @returns {(string|FooJitsu.Url)}
	 */
	$.Url.prototype.param = function(key, value){
		var self = this,
			regex = new RegExp('(\\?|&)'+$.param.encode(key).replace(/\+/g, '(?:%20|\\+)')+'(?:%5B%5D)?=(.+?)($|&)', 'g'),
			matches = [],
			match;

		while ((match = regex.exec(this.search)) !== null) {
			matches.push(match);
			if ($.is.string(match[3])) regex.lastIndex -= match[3].length;
		}

		if ($.is.undef(value)){
			value = $.map(matches, function(m){ return $.param.decode(m[2]); });
			return value.length === 0 ? '' : $.parseValue(value.length === 1 ? value[0] : JSON.stringify(value));
		} else if (matches.length > 0 && value !== ''){
			$.each(matches, function(i, m){
				self.search = self.search.replace(m[0], m[1] + $.param.encode(key) + '=' + $.param.encode(value) + ($.is.string(m[3]) ? m[3] : ''));
			});
		} else if (matches.length > 0 && value === ''){
			$.each(matches, function(i, m){
				self.search = self.search.replace(m[0], m[1]);
			});
			this.search = this.search.replace(/(^\?$|&$)/, '');
		} else if ($.is.defined(value)) {
			this.search += (this.search.indexOf('?') === -1 ? '?' : '&') + $.param.encode(key) + '=' + $.param.encode(value);
		}
		return this;
	};

	/**
	 * Gets or sets multiple query string parameter values.
	 * @param {(string|object)} [params] - A url encoded string or a simple hash of key/value pairs to add.
	 * @returns {(object|FooJitsu.Url)}
	 */
	$.Url.prototype.params = function(params){
		if ($.is.undef(params)){
			return $.param(this.search);
		}
		if ($.is.string(params) && params.indexOf('=') !== -1) params = $.param(params);
		if ($.is.hash(params)){
			var self = this;
			$.each(params, function(key, value){
				self.param(key, value);
			});
		}
		return this;
	};

	/**
	 * Overrides the default toString method and replaces it with a custom one the builds the url from it's parts ensuring
	 * any changes to the properties are reflected.
	 * @returns {string}
	 */
	$.Url.prototype.toString = function(){
		return this.host !== '' ? this.protocol + '//' + this.host + this.pathname + this.search + this.hash : '';
	};

})(FooJitsu);