(function($){
	if ($.version !== '@@version') return;

	/**
	 * Perform an asynchronous HTTP (Ajax) request.
	 * @param {(string|AjaxOptions)} url - A string containing the URL to which the request is sent or the options object.
	 * @param {AjaxOptions} options - A set of key/value pairs that configure the Ajax request. All settings are optional. A default can be set for any option with $.ajax.config().
	 * @returns {FooJitsu.Deferred}
	 */
	$.ajax = function(url, options){
		if ($.is.hash(url)) options = url;
		if ($.is.string(url)){
			options = $.is.hash(options) ? options : {};
			options.url = url;
		}
		var o = $.extend(true, {}, $.ajax.defaults, options);
		o.url = $.is.string(o.url) ? new $.Url(o.url) : o.url;
		o.method = o.method.toLowerCase();
		o.dataType = $.is.string(o.dataType) ? o.dataType.toLowerCase() : o.dataType;
		if (o.dataType === 'jsonp') return $.ajax.jsonp(o);
		return new $.Deferred(function(d){
			var xhr = new XMLHttpRequest();
			xhr.addEventListener('load', function(){
				try {
					if (xhr.status === 200) {
						var response = $.ajax.response(xhr, o);
						d.resolve(response);
					} else {
						d.reject(Error(xhr.statusText), xhr);
					}
				} catch (err) {
					d.reject(err, xhr);
				}
			});
			$.ajax.send(xhr, o);
		});
	};

	/**
	 * The default options for the ajax feature.
	 * @typedef {object} AjaxOptions
	 * @property {(boolean|string)} cache - If set to false, "_={timestamp}" is appended to the end of GET request urls.
	 * 	If a string is supplied it is used in place of the underscore.
	 * @property {?string} contentType - When sending data to the server, use this content type. Default is
	 * 	"application/x-www-form-urlencoded", which is fine for most cases.
	 * @property {(?string|object)} data - Data to be sent to the server. It is converted to a query string, if not
	 * 	already a string. It's appended to the url for GET-requests. Object must be Key/Value pairs.
	 * @property {?string} dataType - The type of data that you're expecting back from the server. If none is specified,
	 * 	FooJitsu will try to infer it based on the MIME type of the response.
	 * @property {object} headers - An object of additional header key/value pairs to send along with requests using the
	 * 	XMLHttpRequest transport.
	 * @property {string} jsonp - Override the callback function name in a JSONP request. This value will be used instead
	 * 	of "callback" in the "callback={function-name}" part of the query string in the url.
	 * @property {boolean} processData - By default, data passed in to the data option as an object will be processed and
	 * 	transformed into a query string, if a string value is passed in it will be url encoded. If you want to send a
	 * 	DOMDocument, or other non-processed data, set this option to false.
	 * @property {string} method - The HTTP method to use for the request ("POST", "GET", "PUT", etc.).
	 * @property {(FooJitsu.Url|?string)} url - The url to send the request to.
	 */
	$.ajax.defaults = {
		cache: true,
		contentType: null,
		data: null,
		dataType: null,
		headers: {},
		jsonp: 'callback',
		processData: true,
		method: 'GET',
		url: null
	};

	/**
	 * Set default values for future Ajax requests.
	 * @param {object} options - The default options to configure.
	 */
	$.ajax.config = function(options){
		$.extend(true, $.ajax.defaults, options);
	};

	/**
	 * Configures the XMLHttpRequest's headers using the supplied options.
	 * @param {XMLHttpRequest} xhr - The XMLHttpRequest to set the headers for.
	 * @param {AjaxOptions} options - The options to retrieve the header information from.
	 */
	$.ajax.setHeaders = function(xhr, options){
		$.each(options.headers, function(name, value){
			if (name.toLowerCase() === 'content-type'){
				options.contentType = value;
			} else {
				xhr.setRequestHeader(name, value);
			}
		});
		if (!$.is.string(options.contentType)
			&& $.inArray(options.method, ['post','patch']) !== -1
			&& !($.is.fn(window.FormData) && options.data instanceof window.FormData)){
			options.contentType = 'application/x-www-form-urlencoded';
		}
		if ($.is.string(options.contentType)) xhr.setRequestHeader('Content-Type', options.contentType);
	};

	/**
	 * Opens the XMLHttpRequest using the supplied url object and options.
	 * @param {XMLHttpRequest} xhr - The XMLHttpRequest to open.
	 * @param {AjaxOptions} options - The options supplied to the .ajax() method.
	 */
	$.ajax.open = function(xhr, options){
		if (!options.cache) options.url.param($.is.boolean(options.cache) ? '_' : options.cache, Date.now());
		xhr.open(options.method, options.url.toString(), true);
		$.ajax.setHeaders(xhr, options);
	};

	/**
	 * Send the XMLHttpRequest to the server.
	 * @param {XMLHttpRequest} xhr - The XMLHttpRequest to send.
	 * @param {AjaxOptions} options - The options supplied to the .ajax() method.
	 */
	$.ajax.send = function (xhr, options) {
		switch (options.method) {
			case 'post':
				$.ajax.send.post(xhr, options);
				break;
			default:
				$.ajax.send.get(xhr, options);
				break;
		}
	};

	/**
	 * Send the XMLHttpRequest using the GET method.
	 * @param {XMLHttpRequest} xhr - The XMLHttpRequest to send.
	 * @param {AjaxOptions} options - The options supplied to the .ajax() method.
	 */
	$.ajax.send.get = function(xhr, options){
		options.url.params(options.data);
		$.ajax.open(xhr, options);
		xhr.send(null);
	};

	/**
	 * Send the XMLHttpRequest using the POST method.
	 * @param {XMLHttpRequest} xhr - The XMLHttpRequest to send.
	 * @param {AjaxOptions} options - The options supplied to the .ajax() method.
	 */
	$.ajax.send.post = function(xhr, options){
		$.ajax.open(xhr, options);
		xhr.send($.ajax.send.post.data(options));
	};

	/**
	 * Processes the data option and returns the result.
	 * @param {AjaxOptions} options - The options supplied to the .ajax() method.
	 * @returns {*}
	 */
	$.ajax.send.post.data = function(options){
		var data = options.data;
		if (options.processData && $.is.hash(options.data)){
			data = options.contentType === 'application/json' ? JSON.stringify(options.data) : $.param(options.data);
		}
		return data;
	};

	/**
	 * Parses the response of the XMLHttpRequest and returns the appropriate value.
	 * @param {XMLHttpRequest} xhr - The XMLHttpRequest to parse.
	 * @param {AjaxOptions} options - The options supplied to the .ajax() method.
	 * @returns {*}
	 */
	$.ajax.response = function(xhr, options){
		switch (options.dataType || xhr.getResponseHeader('Content-Type')){
			case 'application/json':
			case 'json':
				return JSON.parse(xhr.responseText);
			case 'application/xml':
			case 'xml':
				return xhr.responseXML;
			default:
				return xhr.response;
		}
	};

	/**
	 * Perform an asynchronous JSONP request.
	 * @param {AjaxOptions} options - The options supplied to the .ajax() method.
	 * @returns {FooJitsu.Deferred}
	 */
	$.ajax.jsonp = function(options){
		return new $.Deferred(function(d){
			try {
				var script = document.createElement('script'),
					uid = '_' + Math.random().toString(36).substr(2, 9);
				$.ajax.jsonp.callbacks[uid] = function(result){
					delete $.ajax.jsonp.callbacks[uid];
					script.parentNode.removeChild(script);
					d.resolve(result);
				};
				options.url.param(options.data);
				options.url.param(options.jsonp, 'FooJitsu.ajax.jsonp.callbacks.'+uid);
				script.src = options.url.toString();
				document.body.appendChild(script);
			} catch (err) {
				d.reject(err);
			}
		});
	};

	/**
	 * An object used to store JSONP callback functions.
	 * @type {object}
	 */
	$.ajax.jsonp.callbacks = {};

})(FooJitsu);