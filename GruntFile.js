'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			files: ['compiled']
		},
		concat: {
			js: {
				src: [
					"src/foojitsu.js",
					"src/static.js",
					"src/is.js",
					"src/deferred.js",
					"src/browser.js",
					"src/cache.js",
					"src/fn.js",
					"src/events.js"
				],
				dest: 'compiled/foojitsu.js'
			}
		},
		uglify: {
			prod: {
				options: {
					preserveComments: 'some',
					mangle: {
						except: [ "undefined" ]
					}
				},
				files: {
					'compiled/foojitsu.min.js': ["compiled/foojitsu.js"]
				}
			}
		},
		qunit: {
			all: ['tests/*.html'],
			foojitsu: ['tests/foojitsu.html'],
			deferred: ['tests/deferred.html'],
			fn: ['tests/fn.html'],
			is: ['tests/is.html'],
			static: ['tests/static.html'],
			cache: ['tests/cache.html'],
			events: ['tests/events.html']
		}
	});

	// Load grunt tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.registerTask('default', ['clean','concat','uglify']);
	grunt.registerTask('test', ['default','qunit:all']);
};