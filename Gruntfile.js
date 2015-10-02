module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var pkg = grunt.file.readJSON('package.json'),
      bwr = grunt.file.readJSON('bower.json'),
      web_bwr = grunt.file.readJSON('bower_components/dts-snap/bower.json');

  var cloudFrontInvalidation = {
    "Paths": {
      "Quantity": 1,
      "Items": ["index.html"]
    },
    "CallerReference": "build-" + pkg.version
  };

  grunt.initConfig({
    pkg: pkg,
    bwr: bwr,
    web_bwr: web_bwr,
    concurrent: {
      dev: {
        tasks: ['exec:nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    exec: {
      nodemon: 'nodemon',
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
          'temp/application.js': [
            'src/js/**/*.js'
          ]
        }
      },
      web: {
        files: {
          'temp/dependencies.js': web_bwr.resources.js.map(function(file) {
            return 'bower_components/' + file;
          })
        }
      }
    },
    babel: {
      options: {
        compact: false
      },
      client: {
        files: {
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
      }
    }
  });

  grunt.registerTask('default', []);
  grunt.registerTask('buildjs', ['concat:js', 'babel:client']);
  grunt.registerTask('libs', ['copy:bower', 'copy:web', 'concat:web', 'copy:dependencies']);
  grunt.registerTask('buildviews', ['jade:views', 'jade:static']);
  grunt.registerTask('dev', ['build', 'concurrent:dev']);
  grunt.registerTask('build', ['clean:build', 'libs', 'buildjs', 'buildviews']);
  grunt.registerTask('upload', ['aws_s3:dist']);
  grunt.registerTask('release', ['build', 'bump', 'upload']);
};
