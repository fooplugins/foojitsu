module.exports = function(grunt){
	var _ = require('lodash'),
		o = grunt.config('release') || {};

	o = _.extend({
		input: 'compiled/',
		files: ['<%= pkg.name %>.js','<%= pkg.name %>.min.js','<%= pkg.name %>.css','<%= pkg.name %>.min.css','README.md']
	}, o);

	grunt.config.merge({
		copy: {
			release: {
				files: [{ expand: true, cwd: o.input, src: o.files, dest: '' }]
			}
		},
		gitadd: {
			release: {
				options: {
					all: true
				},
				files: ['grunt/**/*.*','src/**/*.*','*.*']
			}
		},
		gitcommit: {
			release: {
				options: {
					message: 'New Release <%= pkg.version %>'
				},
				files: ['grunt/**/*.*','src/**/*.*','*.*']
			}
		},
		gittag: {
			release: {
				options: {
					tag: '<%= pkg.version %>'
				}
			}
		},
		gitpush: {
			release: {
				options: {
					all: true,
					tags: true
				}
			}
		}
	});

	grunt.registerTask('version',
		'Checks if a release exists using the package.json version, exits early and prompts you to update the version number if it does.',
		function() {
			var file = grunt.config('pkg.name')+'.js';
			if (grunt.file.exists(file)){
				var contents = grunt.file.read(file), ver = grunt.config('pkg.version'), regex = new RegExp('@version ' + ver);
				if (typeof contents === 'string' && regex.test(contents)){
					grunt.log.error('Release %s already exists! Update the version in the package.json!', ver);
					return false;
				}
			}
			grunt.log.ok();
			return true;
		});

	grunt.registerTask('release', ['version','test','copy:release','gitadd:release','gitcommit:release','gittag:release','gitpush:release']);
};