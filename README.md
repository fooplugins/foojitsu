#FooJitsu v1.0.5

This library was created as we started to drop support for IE8 and write our plugins using plain JavaScript. It is modeled after jQuery's public API, 
and although it does not support the massive amount of utility methods that jQuery does, it is only 28kb minified at the moment while jQuery 2.0.0 
(no IE8 jQuery) is up at 84kb.

##Usage

At the moment we are making use of the awesome free service [rawgit.com](https://rawgit.com/) as it's just so easy! To include the latest version of FooJitsu 
please use the following:

```html
<script src="//cdn.rawgit.com/fooplugins/foojitsu/1.0.5/foojitsu.min.js"></script>
```

Or grab the compiled files from the repo's root directory and include them in your project. Once included you can use FooJitsu basically like you would jQuery:

```javascript
// shortcut for document ready, same as calling FooJitsu.ready(callback)
FooJitsu(function($){
	// the first argument supplied to the callback is FooJitsu itself allowing us to scope it to the familiar dollar ($) variable.
	$('#my-button').on('click', function(e){
		// ... do something on click
	}).addClass('some-class'); // add a CSS class
});
```

For now check out the tests for a list of supported functions.

##Build

There are four Grunt tasks associated with the build process; **build**, **test**, **readme** and **release**.

####grunt OR grunt build

This is the default task and compiles all **/src/js/** files and outputs the results into the **/compiled/** directory.

####grunt test

This runs the **build** task and if successful then compiles all tests found in **/src/test/** directory and outputs two html files for each test 
into the **/compiled/tests/** directory, one using the concatenated version of the library and the other using the minified. The task then executes 
all tests found in the **/compiled/tests/** directory using QUnit and PhantomJS. 

####grunt readme

This task process the **README.md** in the **/src/** directory and overwrites the one located in the root directory.

####grunt release

This first checks if a release with the current **pkg.version** exists in the root directory. If it does exist the task will fail and warn you to 
update the version number in the **package.json** file. If no release exists it then runs the **test** task. If all tests pass, the **readme** task is
executed and the *foojitsu.js* and *foojitsu.min.js* files from the output of the **build** task are copied to the root directory. Once copied the 
following git tasks are executed:

1. gitadd - Stages all files with changes. This adds, modifies, and removes index entries to match the working tree.
2. gitcommit - Commits all staged changes to the local repo using the title "New Release X.X.X".
3. gittag - Tags the commit with the version number. This is basically a snapshot for [rawgit.com](https://rawgit.com/), without it releases are not accessible.

Once the task is successfully completed you will just need to push the changes to GitHub.