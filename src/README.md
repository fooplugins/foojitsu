#FooJitsu

This library was created as we started to drop support for IE8 and write our plugins using plain JavaScript. It is modeled after jQuery's public API, 
and although it does not support the massive amount of utility methods that jQuery does, it is only 20kb minified (3.7kb gzipped) at the moment while jQuery 2.0.0 
(no IE8 jQuery) is up at 84kb.

##Usage

At the moment we are making use of the awesome free service [rawgit.com](https://rawgit.com/) as it's just so easy! To include the latest version of FooJitsu 
you can use the following:

```html
<script src="https://cdn.rawgit.com/fooplugins/foojitsu/master/releases/foojitsu.min.js"></script>
```

Or grab the files directly from the releases folder and include them in your project. The latest version will always be simply "foojitsu.js" or "foojitsu.min.js". You
can also explicitly state a version to load by appending "-[VERSION]" to the end of the filename like below:

```html
<script src="https://cdn.rawgit.com/fooplugins/foojitsu/master/releases/foojitsu-1.0.3.min.js"></script>
```

Once included you can use FooJitsu basically like you would jQuery:

```javascript
FooJitsu(function($){ // shortcut for document ready, same as calling FooJitsu.ready(callback)
	// the first argument supplied to the callback is FooJitsu itself allowing us to scope it to the familiar dollar ($) variable.
	$('#my-button').on('click', function(e){
		...
	}).addClass('some-class');
});
```

For now check out the tests for a list of supported functions.

##Build

There are three Grunt tasks associated with the build process; **build**, **test** and **release**.

####grunt OR grunt build

This is the default task and compiles all src files and outputs a concatenated and minified version in the **/compiled/** directory.

####grunt test

This runs the **build** task and then executes all QUnit tests found in **/tests/** directory using PhantomJS. 

####grunt release

This first checks if a release with the current **pkg.version** exists in the **/releases/** directory. If it does exist the task will fail and warn you to 
update the version number in the **package.json** file. If no release exists it then runs the **test** task. If all tests pass, the output from the **build** task is 
copied across to the **/releases/** directory twice, once to update the *"latest"* version (ex: *foojitsu.js*) and once to be renamed and create the versioned 
file (ex: *foojitsu-1.2.3.js*).

##Notes

This is just a temporary readme as this library is still in development.