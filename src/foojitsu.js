(function(){

	function $(){
		var self = this, args = Array.prototype.slice.call(arguments);
		if (!(this instanceof $)){
			function FooJitsu(args) { return $.apply(this, args); }
			FooJitsu.prototype = $.prototype;
			return new FooJitsu(args);
		}
		this.context = $.getContext(args);
		this.length = 0;
		var arg1 = args.shift();
		if ($.is.self(arg1)) {
			return arg1;
		} else if ($.is.selector(arg1)) {
			return $(this.context.querySelectorAll(arg1), this.context);
		} else if ($.is.html(arg1)) {
			return $($.parseHTML(arg1), this.context);
		} else if ($.is.element(arg1) || arg1 === window) {
			this[0] = arg1;
			this.length = 1;
		} else if ($.is.array(arg1) || $.is.arrayLike(arg1)) {
			$.each(arg1, function(i, value){
				if ($.is.element(value)) self[i] = value;
			});
			this.length = arg1.length;
		} else if ($.is.fn(arg1)){
			$.ready(arg1);
		}
	}

	$.version = '@@version';

	var ver = /[\d\.]/;
	/**
	 * Compares two version numbers. 0 if the versions are equal, -1 if v1 < v2, 1 if v1 > v2 and NaN if either version is invalid.
	 * @param {string} v1 The first version to be compared.
	 * @param {string} v2 The second version to be compared.
	 * @returns {(number|NaN)}
	 */
	$.versionCompare = function(v1, v2){
		function split(v){
			var res = v.split('.');
			for(var i = 0, len = res.length; i < len; i++){
				res[i] = parseInt(res[i]);
				if (isNaN(res[i])) res[i] = 0;
			}
			return res;
		}

		if (!(ver.test(v1) && ver.test(v2))) return NaN;
		var v1parts = split(v1),
			v2parts = split(v2);

		while (v1parts.length < v2parts.length) v1parts.push(0);
		while (v2parts.length < v1parts.length) v2parts.push(0);

		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length == i) return 1;
			if (v1parts[i] == v2parts[i]) continue;
			if (v1parts[i] > v2parts[i]) return 1;
			else return -1;
		}
		if (v1parts.length != v2parts.length) return -1;
		return 0;
	};

	var exists = !!window.FooJitsu;
	if (!exists || (exists && $.versionCompare($.version, window.FooJitsu.version) > 0)){
		window.FooJitsu = $;
	}

})();