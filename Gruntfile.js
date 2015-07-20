module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bwr: grunt.file.readJSON('bower.json'),
    dist: 'dist',
    concurrent: {
      dev: {
        tasks: ['exec:nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      },
      debug: {
        tasks: ['exec:nodemon_debug', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    exec: {
      nodemon: 'nodemon',
      nodemon_debug: 'nodemon --debug'
    },
    watch: {
      css: {
        files: 'src/less/**/*',
        tasks: ['devbuildcss'],
        options: {
          interrupt: true,
        }
      },
      js: {
        files: ['src/js/**/*'],
        tasks: ['devbuildjs'],
        options: {
          interrupt: true,
        }
      },
      assets: {
        files: ['assets/**/*'],
        tasks: ['devbuildassets'],
        options: {
          interrupt: true,
        }
      }
    },
    cssmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/css/',
          src: ['**/*.css', '!*.min.css'],
          dest: 'dist/css/',
          ext: '.min.css'
        }]
      }
    },
    concat: {
      options: {
        process: function(src, filepath) {
          return '//' + filepath + grunt.util.linefeed + grunt.util.linefeed + src;
        }
      },
      js: {
        files: {
          'temp/snap.js': [
            'src/js/shared/**/*.js',
            'src/js/**/*.js'
          ]
        }
      },
      css: {
        files: {
          'temp/main_classic.less': [
            'libs/normalize-css/normalize.css',
            'src/less/classic/main/*.less'
          ],
          'temp/main_galaxies.less': [
            'libs/normalize-css/normalize.css',
            'src/less/galaxies/main/*.less'
          ]
        }
      }
    },
    jshint: {
      all: ['src/js/**/*.js'],
      options: grunt.file.readJSON('.jshintrc')
    },
    babel: {
      options: {
        sourceMap: 'inline',
        compact: false
      },
      client: {
        files: {
          'dist/js/snap.js': 'temp/snap.js'
        }
      }
    },
    less: {
      options: {
        cleancss: true
      },
      all: {
        files: {
          'dist/css/classic/main.css': 'temp/main_classic.less',
          'dist/css/classic/desktop.css': 'src/less/classic/desktop.less',
          'dist/css/classic/mobile.css': 'src/less/classic/mobile.less',
          'dist/css/galaxies/main.css': 'temp/main_galaxies.less',
          'dist/css/galaxies/desktop.css': 'src/less/galaxies/desktop.less',
          'dist/css/galaxies/mobile.css': 'src/less/galaxies/mobile.less'
        }
      }
    },
    uglify: {
      options: {
        mangle: false,
        sourceMap: true
      },
      dist: {
        files: {
          'dist/js/snap.min.js': 'dist/js/snap.js'
        }
      }
    },
    clean: {
      dist: 'dist',
      temp: 'temp'
    },
    bump: {
      options: {
        files: ['package.json','bower.json'],
        updateConfigs: ['pkg', 'bwr'],
        commitFiles: ['-a'],
        pushTo: 'origin',
        tagName: '%VERSION%'
      }
    }
  });

  grunt.registerTask('default', []);
  grunt.registerTask('validate', ['jshint']);
  grunt.registerTask('build', ['clean', 'buildcss', 'buildjs', 'buildassets']);
  grunt.registerTask('buildassets', []);
  grunt.registerTask('buildcss', ['concat:css', 'less', 'cssmin']);
  grunt.registerTask('buildjs', ['concat:js', 'babel:client', 'uglify']);
  grunt.registerTask('devbuildcss', ['concat:css', 'less']);
  grunt.registerTask('devbuildjs', ['concat:js', 'babel:client']);
  grunt.registerTask('devbuildassets', ['buildassets']);
  grunt.registerTask('run', ['concurrent:dev']);
  grunt.registerTask('dev', ['build', 'concurrent:dev']);
  grunt.registerTask('debug', ['build', 'concurrent:debug']);
  grunt.registerTask('publish', []);
  grunt.registerTask('release', ['validate', 'build', 'bump', 'publish']);
};
