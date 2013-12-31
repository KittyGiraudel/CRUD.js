module.exports = function(grunt) {

  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        'src/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    uglify: {
      options: {
        mangle: true
      },
      target: {
        files: {
          'crud.min.js': 'src/*.js'
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
        tasks: ['uglify']
      },
      html: {
        files: '*.html'
      }
    }

  };

  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('deploy', ['uglify']);
};
