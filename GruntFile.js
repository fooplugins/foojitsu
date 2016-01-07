'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			files: ['compiled']
		},
		concat: {
			options: {
				banner: '/*!\n' +
				'* <%= pkg.title %> - <%= pkg.description %>\n' +
				'* @version <%= pkg.version %>\n' +
				'* @link <%= pkg.homepage %>\n' +
				'* @copyright <%= pkg.author.name %> <%= grunt.template.today("yyyy") %>\n' +
				'* @license Released under the <%= pkg.license %> license.\n' +
				'*/\n'
			},
			js: {
				src: [
					"src/foojitsu.js",
					"src/is.js",
					"src/browser.js",
					"src/static.js",
					"src/deferred.js",
					"src/cache.js",
					"src/fn.js",
					"src/events.js"
				],
				dest: 'compiled/<%= pkg.name %>.js'
			}
		},
		replace: {
			dist: {
				options: {
					patterns: [{
						match: 'version',
						replacement: '<%= pkg.version %>'
					}]
				},
				files: [
					{expand: true, flatten: true, src: ['compiled/<%= pkg.name %>.js'], dest: 'compiled/'}
				]
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
					'compiled/<%= pkg.name %>.min.js': ["compiled/<%= pkg.name %>.js"]
				}
			}
		},
		qunit: {
			all: ['tests/*.html'],
			// the below are so you can execute a single test manually during development, they're not used in any registered tasks
			foojitsu: ['tests/foojitsu.html'],
			deferred: ['tests/deferred.html'],
			fn: ['tests/fn.html'],
			is: ['tests/is.html'],
			static: ['tests/static.html'],
			cache: ['tests/cache.html'],
			events: ['tests/events.html'],
			browser: ['tests/browser.html']
		},
		copy: {
			version: {
				files: [{
					expand: true,
					cwd: 'compiled/',
					src: ['<%= pkg.name %>.js','<%= pkg.name %>.min.js'],
					dest: 'releases/',
					rename: function(dest, src){
						return dest + src.replace(/(.min.js|.js)/, '-'+grunt.config('pkg.version')+'$1');
					}
				}]
			},
			latest: {
				files: [{
					expand: true,
					cwd: 'compiled/',
					src: ['<%= pkg.name %>.js','<%= pkg.name %>.min.js'],
					dest: 'releases/'
				}]
			}
		}
	});

	// Load grunt tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-qunit');

	grunt.registerTask('build', ['clean','concat','replace','uglify']);
	grunt.registerTask('default', ['build']);
	grunt.registerTask('test', ['default','qunit:all']);

	grunt.registerTask('release-exists', 'Checks if a release exists using the package.json properties, exits early and prompts you to update the version number if it does.', function() {
		var file = 'releases/'+grunt.config('pkg.name')+'-'+grunt.config('pkg.version')+'.js';
		if (grunt.file.exists(file)){
			grunt.log.error('%s already exists! Update the version in the package.json!', file);
			return false;
		}
		grunt.log.ok();
		return true;
	});
	grunt.registerTask('release', ['release-exists','test','copy']);
};