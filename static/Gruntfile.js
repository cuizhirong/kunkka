var webpackConfig = require('./webpack.config.js');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var I18nPlugin = require("i18n-webpack-plugin");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('../package.json'),
    banner: '/*!\n' +
      ' * Halo v<%= pkg.version %>\n' +
      ' * Powered by UNITEDSTACK Inc.\n' +
      ' */\n',

    // Task configuration.
    clean: {
      dist: ['static/dist']
    },

    less: {
      compile: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: 'static/dist/css/<%= pkg.name %>.css.map'
        },
        files: {
          'static/dist/css/<%= pkg.name %>.css': 'static/style/login/index.less'
        }
      }
    },

    postcss: {
      options: {
        map: {
          prev: 'static/dist/css',
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
          'static/dist/css/halo.min.css': 'static/dist/css/halo.css'
        }
      }
    },

    webpack: {
      options: webpackConfig,
      build: {}
    },

    usebanner: {
      options: {
        position: 'top',
        banner: '<%= banner %>'
      },
      files: {
        src: ['dist/*']
      }
    },

    copy: {
      uskin: {
        expand: true,
        cwd: 'static/common/uskin/dist/css',
        src: '**',
        dest: 'static/dist/uskin'
      }
    }

  });

  grunt.file.setBase('../');

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {
    scope: 'devDependencies'
  });

  require('time-grunt')(grunt);

  // Load task-related files from the specified directory
  // grunt.task.loadTasks('./grunt');

  // Build CSS
  // grunt.registerTask('css', ['less', 'postcss']);

  // Build JS
  grunt.registerTask('js', ['webpack:build']);

  // Default task.
  grunt.registerTask('build', ['clean', 'js', 'usebanner', 'copy']);

};
