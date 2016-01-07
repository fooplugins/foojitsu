'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		build: {
			js: [
				'src/js/foojitsu.js',
				'src/js/is.js',
				'src/js/browser.js',
				'src/js/static.js',
				'src/js/deferred.js',
				'src/js/cache.js',
				'src/js/fn.js',
				'src/js/events.js'
			]
		}
	});

	// Load grunt tasks
	require('load-grunt-tasks')(grunt);
	grunt.loadTasks('grunt');

	grunt.registerTask('default', ['build']);
};