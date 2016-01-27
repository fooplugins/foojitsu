module.exports = function(grunt){
	var _ = require('lodash'),
		o = grunt.config('build') || {},
		files = {}, jsmin = {}, cssmin = {};

	o = _.extend({
		output: 'compiled/',
		replace: [{ match: 'version', replacement: '<%= pkg.version %>' }],
		js: null,
		css: null
	}, o);

	if (!!o.js || !!o.css){
		var tasks = ['clean:build', 'concat:build', 'replace:build'];
		if (!!o.js){
			tasks.push('uglify:build');
			files[o.output+'<%= pkg.name %>.js'] = o.js;
			jsmin[o.output+'<%= pkg.name %>.min.js'] = [o.output+'<%= pkg.name %>.js'];
			grunt.config.merge({
				uglify: {
					build: {
						options: {
							preserveComments: /(?:^!|@(?:license|preserve|cc_on))/,
							mangle: {
								except: [ 'undefined' ]
							}
						},
						files: jsmin
					}
				}
			});
		}
		if (!!o.css){
			tasks.push('cssmin:build');
			files[o.output+'<%= pkg.name %>.css'] = o.css;
			cssmin[o.output+'<%= pkg.name %>.min.css'] = [o.output+'<%= pkg.name %>.css'];
			grunt.config.merge({
				cssmin: {
					build: {
						options: {
							keepSpecialComments: 1
						},
						files: cssmin
					}
				}
			});
		}
		grunt.config.merge({
			clean: {
				build: [o.output]
			},
			concat: {
				build: {
					options: {
						banner: '/*!\n' +
						'* <%= pkg.title %> - <%= pkg.description %>\n' +
						'* @version <%= pkg.version %>\n' +
						'* @link <%= pkg.homepage %>\n' +
						'* @copyright <%= pkg.author.name %> <%= grunt.template.today("yyyy") %>\n' +
						'* @license Released under the <%= pkg.license %> license.\n' +
						'*/\n'
					},
					files: files
				}
			},
			replace: {
				build: {
					options: { patterns: o.replace },
					files: [{
						expand: true, flatten: true, src: [o.output+'<%= pkg.name %>.js',o.output+'<%= pkg.name %>.css'], dest: o.output
					}]
				}
			}
		});
		grunt.registerTask('build', tasks);
	} else {
		grunt.registerTask('build', function(){
			grunt.log.error('You must configure either the "build.js" or "build.css" options.');
		});
	}
};