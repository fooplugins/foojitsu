module.exports = function(grunt){
	var _ = require('lodash'),
		o = grunt.config('test') || {};

	o = _.extend({
		input: 'src/tests/',
		output: 'compiled/tests/',
		replace: [{ match: 'version', replacement: '<%= pkg.version %>' }]
	}, o);

	grunt.config.merge({
		replace: {
			test: {
				options: {
					patterns: o.replace.slice().concat([{ match: 'file', replacement: '../<%= pkg.name %>.js' }])
				},
				files: [{ expand: true, flatten: true, src: [o.input+'*.html'], dest: o.output }]
			},
			test_min: {
				options: {
					patterns: o.replace.slice().concat([{ match: 'file', replacement: '../<%= pkg.name %>.min.js' }])
				},
				files: [{
					expand: true, flatten: true, src: [o.input+'*.html'], dest: o.output,
					rename: function(dest, src){
						return dest + src.replace(/(\.html|\.htm)$/, '.min$1');
					}
				}]
			},
			breakpoints: {
				options: {
					patterns: o.replace.slice().concat([
						{ match: 'file', replacement: '../../<%= pkg.name %>.js' },
						{ match: 'frame', replacement: 'frame.html' }
					])
				},
				files: [
					{ expand: true, flatten: true, src: [o.input+'breakpoints/*.html'], dest: o.output+'breakpoints/' }
				]
			},
			breakpoints_min: {
				options: {
					patterns: o.replace.slice().concat([
						{ match: 'file', replacement: '../../<%= pkg.name %>.min.js' },
						{ match: 'frame', replacement: 'frame.min.html' }
					])
				},
				files: [{
					expand: true, flatten: true, src: [o.input+'breakpoints/*.html'], dest: o.output+'breakpoints/',
					rename: function(dest, src){
						return dest + src.replace(/(\.html|\.htm)$/, '.min$1');
					}
				}]
			}
		},
		copy: {
			test: {
				files: [{
					expand: true,
					cwd: o.input+'content/',
					src: ['*.*'],
					dest: o.output+'content/'
				}]
			}
		},
		qunit: {
			test: [o.output+'*.html'],
			breakpoints: [o.input+'breakpoints/test.html',o.input+'breakpoints/test.min.html']
		}
	});

	grunt.registerTask('build-tests', ['build', 'replace:test', 'replace:test_min', 'replace:breakpoints', 'replace:breakpoints_min', 'copy:test']);
	grunt.registerTask('test', ['build-tests', 'qunit:test']);
};