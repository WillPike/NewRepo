var fs = require('fs');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var pkg = grunt.file.readJSON('package.json'),
      bwr = grunt.file.readJSON('bower.json');

  function listFiles(dir, files_) {
      files_ = files_ || [];
      var files = fs.readdirSync(dir);

      for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
          getFiles(name, files_);
        }
        else {
          files_.push(name);
        }
      }

      return files_;
  }

  function createManifest(layout) {
    return function(fs, fd, done) {
      var data = JSON.stringify({
        images: listFiles('assets/' + layout + '/images'),
        partials: listFiles('assets/' + layout + '/partials')
      }, null, 2);

      fs.writeSync(fd, data);
      done();
    };
  }

  grunt.initConfig({
    pkg: pkg,
    bwr: bwr,
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
        tasks: ['buildcss']
      },
      js: {
        files: ['src/js/**/*', '!*.min.js'],
        tasks: ['buildjs']
      },
      assets: {
        files: ['assets/**/*'],
        tasks: ['buildassets']
      }
    },
    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'temp/css/',
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
            'src/js/_base.js',
            'src/js/shared/**/*.js',
            'src/js/**/*.js',
            'src/js/*.js'
          ]
        }
      },
      css: {
        files: {
          'temp/main_classic.less': 'src/less/classic/main/*.less',
          'temp/main_galaxies.less': 'src/less/galaxies/main/*.less'
        }
      },
      web: {
        files: {
          'bower_components/dependencies.js': bwr.resources.js.map(function(file) {
            return 'bower_components/' + file;
          })
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
      classic: {
        options: {
          modifyVars: {
            images: '"../../assets/classic/images"'
          }
        },
        files: {
          'temp/css/classic_main.css': 'temp/main_classic.less',
          'temp/css/classic_desktop.css': 'src/less/classic/desktop.less',
          'temp/css/classic_mobile.css': 'src/less/classic/mobile.less'
        }
      },
      galaxies: {
        options: {
          modifyVars: {
            images: '"../../assets/galaxies/images"'
          }
        },
        files: {
          'temp/css/galaxies_main.css': 'temp/main_galaxies.less',
          'temp/css/galaxies_desktop.css': 'src/less/galaxies/desktop.less',
          'temp/css/galaxies_mobile.css': 'src/less/galaxies/mobile.less'
        }
      }
    },
    postcss: {
      options: {
        processors: [
          require('autoprefixer-core')({
            browsers: 'last 2 versions'
          })
        ]
      },
      dist: {
        src: 'temp/css/*.css'
      }
    },
    uglify: {
      options: {
        mangle: false,
        sourceMap: true
      },
      snap: {
        files: {
          'dist/js/snap.min.js': 'dist/js/snap.js'
        }
      }
    },
    'file-creator': {
      'manifest': {
        'assets/classic/manifest.json': createManifest('classic'),
        'assets/galaxies/manifest.json': createManifest('galaxies'),
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
        commitMessage: 'Build #%VERSION%',
        tagName: '%VERSION%',
        commit: true,
        push: true,
        pushTo: 'origin',
        createTag: true
      }
    }
  });

  grunt.registerTask('default', []);
  grunt.registerTask('validate', ['jshint']);
  grunt.registerTask('build', ['clean', 'buildcss', 'buildjs', 'buildassets', 'clean:temp']);
  grunt.registerTask('buildassets', ['concat:web', 'file-creator:manifest']);
  grunt.registerTask('buildcss', ['concat:css', 'less', 'postcss', 'cssmin']);
  grunt.registerTask('buildjs', ['concat:js', 'babel:client', 'uglify']);
  grunt.registerTask('run', ['concurrent:dev']);
  grunt.registerTask('dev', ['build', 'concurrent:dev']);
  grunt.registerTask('debug', ['build', 'concurrent:debug']);
  grunt.registerTask('publish', ['bump']);
  grunt.registerTask('release', ['validate', 'build', 'publish']);
};
