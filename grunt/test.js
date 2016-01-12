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
			test: [o.output+'*.html']
		}
	});

	grunt.registerTask('build-tests', ['build', 'replace:test', 'replace:test_min', 'copy:test']);
	grunt.registerTask('test', ['build-tests', 'qunit:test']);
};