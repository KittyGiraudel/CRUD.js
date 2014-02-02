module.exports = function(grunt) {
  'use strict';

  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        'dist/CRUD.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    concat: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
      },
      dist: {
        src: [
          'src/intro.js',
          'src/helper.js',
          'src/CRUD.js',
          'src/StorageDriver.js',
          'src/outro.js'
        ],
        dest: 'dist/CRUD.js'
      }
    },

    uglify: {
      target: {
        files: {
          'dist/CRUD.min.js': 'dist/CRUD.js'
        }
      }
    },

    connect: {
      test: {
        options: {
          port: '8234',
          hostname:'localhost',
          keepalive: true
        }
      },
      options: {
        port: 9000,
        hostname: 'localhost',
        livereload: 35729
      }
    },

    watch: {
      uglify: {
        files: 'src/*.js',
        tasks: ['test']
      },
      html: {
        files: '*.html'
      }
    }

  };

  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');


  grunt.registerTask('build', ['concat', 'uglify']);

  grunt.registerTask('test', ['build', 'jshint']);
  grunt.registerTask('deploy', ['build']);
};
