var webpackConfig = require('./webpack.config.js');
var webpack = require('webpack');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
      ' * Halo v<%= pkg.version %>\n' +
      ' * Powered by UNITEDSTACK Inc.\n' +
      ' */\n',

    // Task configuration.
    clean: {
      dist: ['dist']
    },

    less: {
      compile: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: 'dist/css/<%= pkg.name %>.css.map'
        },
        files: {
          'dist/css/<%= pkg.name %>.css': 'static/style/index.less'
        }
      }
    },

    postcss: {
      options: {
        map: {
          prev: 'dist/css',
          inline: false
        },
        processors: [
          require('autoprefixer')({
            browsers: ['> 1%', 'last 2 versions']
          }),
          require('postcss-class-prefix')(''),
          require('cssnano')()
        ]
      },
      dist: {
        files: {
          'dist/css/halo.min.css': 'dist/css/halo.css'
        }
      }
    },

    webpack: {
      options: webpackConfig,
      build: {
        output: {
          filename: '[hash].[name].min.js'
        },
        plugins: [new webpack.optimize.UglifyJsPlugin()]
      }
    },

    usebanner: {
      options: {
        position: 'top',
        banner: '<%= banner %>'
      },
      files: {
        src: ['dist/css/*.css', 'dist/js/*.js']
      }
    },

    copy: {
      fonts: {
        expand: true,
        cwd: './css',
        src: 'fonts/*',
        dest: 'dist/css'
      }
    }

  });


  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {
    scope: 'devDependencies'
  });
  require('time-grunt')(grunt);

  // Load task-related files from the specified directory
  // grunt.task.loadTasks('./grunt');

  // Build CSS
  grunt.registerTask('css', ['less', 'postcss']);

  // Build JS
  grunt.registerTask('js', ['webpack:build']);

  // Default task.
  grunt.registerTask('build', ['clean', 'css', 'js', 'usebanner']);

};
