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
					'src/js/foojitsu.js',
					'src/js/is.js',
					'src/js/browser.js',
					'src/js/static.js',
					'src/js/deferred.js',
					'src/js/cache.js',
					'src/js/fn.js',
					'src/js/events.js'
				],
				dest: 'compiled/<%= pkg.name %>.js'
			}
		},
		replace: {
			options: {
				patterns: [{ match: 'version', replacement: '<%= pkg.version %>' }]
			},
			js: {
				files: [{expand: true, flatten: true, src: ['compiled/<%= pkg.name %>.js'], dest: 'compiled/'}]
			},
			readme: {
				files: [{expand: true, flatten: true, src: ['src/README.md'], dest: 'compiled/'}]
			},
			tests: {
				options: {
					patterns: [{ match: 'file', replacement: '../<%= pkg.name %>.js' }]
				},
				files: [{ expand: true, flatten: true, src: ['src/tests/*.html'], dest: 'compiled/tests/' }]
			},
			tests_min: {
				options: {
					patterns: [{ match: 'file', replacement: '../<%= pkg.name %>.min.js' }]
				},
				files: [{
					expand: true,
					cwd: 'src/tests/',
					src: ['*.html'],
					dest: 'compiled/tests/',
					rename: function(dest, src){
						return dest + src.replace(/(\.html|\.htm)$/, '.min$1');
					}
				}]
			}
		},
		uglify: {
			js: {
				options: {
					preserveComments: 'some',
					mangle: {
						except: [ 'undefined' ]
					}
				},
				files: {
					'compiled/<%= pkg.name %>.min.js': ['compiled/<%= pkg.name %>.js']
				}
			}
		},
		qunit: {
			all: ['compiled/tests/*.html']
		},
		copy: {
			tests: {
				files: [{
					expand: true,
					cwd: 'src/tests/content/',
					src: ['*.*'],
					dest: 'compiled/tests/content/'
				}]
			},
			readme: {
				files: [{
					expand: true,
					cwd: 'compiled/',
					src: ['README.md'],
					dest: ''
				}]
			},
			release: {
				files: [{
					expand: true,
					cwd: 'compiled/',
					src: ['<%= pkg.name %>.js','<%= pkg.name %>.min.js'],
					dest: 'releases/',
					rename: function(dest, src){
						return dest + src.replace(/(.min.js|.js)$/, '-'+grunt.config('pkg.version')+'$1');
					}
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

	grunt.registerTask('build', ['clean','concat','replace','copy:tests','uglify']);
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
	grunt.registerTask('release', ['release-exists','test','copy:release','copy:readme']);
};