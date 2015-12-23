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
		if ($.is.selector(arg1)) {
			return $(this.context.querySelectorAll(arg1), this.context);
		} else if ($.is.element(arg1)) {
			this[0] = arg1;
			this.length = 1;
		} else if ($.is.array(arg1) || $.is.self(arg1) || $.is.arrayLike(arg1)) {
			$.each(arg1, function(i, value){
				if ($.is.element(value)) self[i] = value;
			});
			this.length = arg1.length;
		} else if ($.is.fn(arg1)){
			$.ready(arg1);
		}
	}

	window.FooJitsu = $;

})();