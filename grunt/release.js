module.exports = function(grunt){
	var _ = require('lodash'),
		o = grunt.config('release') || {};

	o = _.extend({
		input: 'compiled',
		output: 'releases'
	}, o);

	grunt.config.merge({
		copy: {
			release: {
				files: [{
					expand: true,
					cwd: o.input+'/',
					src: ['README.md'],
					dest: ''
				},{
					expand: true,
					cwd: o.input+'/',
					src: ['<%= pkg.name %>.js','<%= pkg.name %>.min.js'],
					dest: o.output+'/',
					rename: function(dest, src){
						return dest + src.replace(/(.min.js|.js)$/, '-'+grunt.config('pkg.version')+'$1');
					}
				}]
			}
		}
	});

	grunt.registerTask('version',
		'Checks if a release exists using the package.json version, exits early and prompts you to update the version number if it does.',
		function() {
			var file = o.output+'/'+grunt.config('pkg.name')+'-'+grunt.config('pkg.version')+'.js';
			if (grunt.file.exists(file)){
				grunt.log.error('%s already exists! Update the version in the package.json!', file);
				return false;
			}
			grunt.log.ok();
			return true;
		});

	grunt.registerTask('release', ['version','test','copy:release']);
};