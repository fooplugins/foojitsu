(function($){

	var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
		elem = document.createElement('div');

	function test(nameOrHash, style){
		var test = !!style ? elem.style : elem;
		if ($.is.string(nameOrHash)){
			nameOrHash = nameOrHash.charAt(0).toUpperCase() + nameOrHash.substr(1);
			for (var i = 0, l = prefixes.length; i < l; i++) {
				if ($.is.string(test[prefixes[i] + nameOrHash])) return true;
			}
			return false;
		}
		if ($.is.hash(nameOrHash)){
			for (var name in nameOrHash) {
				if (!nameOrHash.hasOwnProperty(name)) continue;
				if ($.is.defined(test[name])) return nameOrHash[name];
			}
			return null;
		}
	}

	$.browser = {};

	$.browser.storage = (function(w){
		return 'localStorage' in w && w['localStorage'] !== null;
	})(window);

	$.browser.touch = (function(w){
		return 'ontouchstart' in w;
	})(window);

	$.browser.transitions = test('transition', true);

	$.browser._events = {
		"transitionend": test({
			'transition': 'transitionend',
			'OTransition': 'otransitionend',
			'MozTransition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd'
		}, true)
	};

	$.browser.event = function(name){
		return $.is.string($.browser._events[name]) ? $.browser._events[name] : name;
	};

	$.browser._css = {
		"transform": test({
			'transform': 'transform',
			'msTransform': 'msTransform',
			'OTransform': 'OTransform',
			'MozTransform': 'MozTransform',
			'WebkitTransform': 'WebkitTransform'
		}, true)
	};

	$.browser.css = function(name){
		return $.is.string($.browser._css[name]) ? $.browser._css[name] : name;
	};

})(FooJitsu);