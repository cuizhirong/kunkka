var webpackConfig = require('./webpack.config.js');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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
      dist: ['client/dist']
    },

    cssnano: {
      options: {
        sourcemap: false
      },
      dist: {
        files: [{
          src: 'client/dist/*.css',
          dest: 'client/dist/'
        }]
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
        src: ['client/dist/*']
      }
    },

    copy: {
      uskin: {
        expand: true,
        cwd: 'client/uskin/dist/css',
        src: '**',
        dest: 'client/dist/uskin'
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

  // Cope with the rest stuffs
  grunt.registerTask('rest', ['cssnano', 'usebanner', 'copy']);

  // Default task.
  // grunt.registerTask('build', ['clean', 'js', 'cssnano', 'usebanner', 'copy']);

};
