<<<<<<< HEAD
var fs = require('fs');

=======
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var pkg = grunt.file.readJSON('package.json'),
<<<<<<< HEAD
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
=======
      bwr = grunt.file.readJSON('bower.json'),
      web_bwr = grunt.file.readJSON('bower_components/dts-snap/bower.json');

  var cloudFrontInvalidation = {
    "Paths": {
      "Quantity": 1,
      "Items": ["index.html"]
    },
    "CallerReference": "build-" + pkg.version
  };
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b

  grunt.initConfig({
    pkg: pkg,
    bwr: bwr,
<<<<<<< HEAD
    dist: 'dist',
=======
    web_bwr: web_bwr,
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
    concurrent: {
      dev: {
        tasks: ['exec:nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
<<<<<<< HEAD
      },
      debug: {
        tasks: ['exec:nodemon_debug', 'watch'],
        options: {
          logConcurrentOutput: true
        }
=======
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
      }
    },
    exec: {
      nodemon: 'nodemon',
<<<<<<< HEAD
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
        files: [
          'assets/**/*',
          '!assets/classic/manifest.json',
          '!assets/galaxies/manifest.json'
        ],
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
=======
      init: {
        command: 'aws configure set preview.cloudfront true'
      },
      invalidate: {
        command: 'aws cloudfront create-invalidation --cli-input-json \'' + JSON.stringify(cloudFrontInvalidation) + '\''
      }
    },
    watch: {
      js: {
        files: ['src/js/**/*', '!*.min.js'],
        tasks: ['buildjs']
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
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
<<<<<<< HEAD
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
          'temp/main_galaxies.less': 'src/less/galaxies/main/*.less',
          'temp/desktop_galaxies.less': [
            'src/less/galaxies/main/_variables.less',
            'src/less/galaxies/desktop.less'
          ],
          'temp/mobile_galaxies.less': [
            'src/less/galaxies/main/_variables.less',
            'src/less/galaxies/mobile.less'
=======
          'temp/application.js': [
            'src/js/**/*.js'
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
          ]
        }
      },
      web: {
        files: {
<<<<<<< HEAD
          'bower_components/dependencies.js': bwr.resources.js.map(function(file) {
=======
          'temp/dependencies.js': web_bwr.resources.js.map(function(file) {
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
            return 'bower_components/' + file;
          })
        }
      }
    },
<<<<<<< HEAD
    jshint: {
      all: ['src/js/**/*.js'],
      options: grunt.file.readJSON('.jshintrc')
    },
    babel: {
      options: {
        sourceMap: 'inline',
=======
    babel: {
      options: {
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
        compact: false
      },
      client: {
        files: {
<<<<<<< HEAD
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
          'temp/css/galaxies_desktop.css': 'temp/desktop_galaxies.less',
          'temp/css/galaxies_mobile.css': 'temp/mobile_galaxies.less'
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
=======
          'www/<%=pkg.version%>/application.js': 'temp/application.js'
        }
      }
    },
    jade: {
      views: {
        options: {
          pretty: true,
          data: {
            version: pkg.version,
            platform: 'web',
            libs: 'libs/',
            snap: 'libs/<%=web_bwr.name%>/',
            bower: web_bwr
          }
        },
        files: [
          {
            expand: true,
            cwd: 'bower_components/<%=web_bwr.name%>/views/',
            src: ['*.jade', '!_*'],
            dest: 'www/<%=pkg.version%>/',
            ext: '.html'
          }
        ]
      },
      static: {
        options: {
          pretty: true,
          data: {
            version: pkg.version
          }
        },
        files: [
          {
            expand: true,
            cwd: 'src/views/',
            src: ['*.jade', '!_*'],
            dest: 'www/',
            ext: '.html'
          }
        ]
      }
    },
    copy: {
      bower: {
        files: [{
          expand: true,
          cwd: 'bower_components/',
          src: web_bwr.resources.libs.map(function(dir) {
            return dir + '/**/*';
          }),
          dest: 'www/<%=pkg.version%>/libs/'
        }]
      },
      dependencies: {
        files: [{
          src: 'temp/dependencies.js',
          dest: 'www/<%=pkg.version%>/libs/dependencies.js'
        }]
      },
      web: {
        files: [
          {
            expand: true,
            cwd: 'bower_components/<%=web_bwr.name%>',
            src: [ 'assets/**', 'dist/**' ],
            dest: 'www/<%=pkg.version%>/libs/<%=web_bwr.name%>'
          },
          {
            'www/favicon.ico': 'bower_components/<%=web_bwr.name%>/assets/favicon.ico'
          }
        ]
      }
    },
    clean: {
      build: ['www', 'temp']
    },
    aws_s3: {
      options: {
        region: 'us-west-2',
        bucket: 'web.managesnap.com',
        accessKeyId: '<% process.env.AWS_ACCESS_KEY_ID %>',
        secretAccessKey: '<% process.env.AWS_SECRET_ACCESS_KEY %>'
      },
      dist: {
  			files: [{
          expand: true,
          action: 'upload',
          cwd: 'www',
          src: ['**'],
  				dest: ''
  			}]
  		}
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commitFiles: ['-a'],
        commitMessage: 'Build #<%=pkg.version%>',
        tagName: '<%=pkg.version%>',
        commit: true,
        push: false,
        createTag: false
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
      }
    }
  });

  grunt.registerTask('default', []);
<<<<<<< HEAD
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
=======
  grunt.registerTask('buildjs', ['concat:js', 'babel:client']);
  grunt.registerTask('libs', ['copy:bower', 'copy:web', 'concat:web', 'copy:dependencies']);
  grunt.registerTask('buildviews', ['jade:views', 'jade:static']);
  grunt.registerTask('dev', ['build', 'concurrent:dev']);
  grunt.registerTask('build', ['clean:build', 'libs', 'buildjs', 'buildviews']);
  grunt.registerTask('upload', ['aws_s3:dist']);
  grunt.registerTask('release', ['build', 'bump', 'upload']);
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
};
