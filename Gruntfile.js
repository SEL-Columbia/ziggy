module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['output'],
        jshint: {
            all: ['package.json', 'Gruntfile.js', 'ziggy/src/*.js']
        },
        karma: {
            dev: {
                configFile: 'karma.conf.js',
                runnerPort: 9999,
                singleRun: true,
                browsers: ['PhantomJS']
            },
            chrome: {
                configFile: 'karma.conf.js',
                runnerPort: 9999,
                singleRun: true,
                browsers: ['Chrome']
            },
            debug: {
                configFile: 'karma.conf.js',
                runnerPort: 9999,
                autoWatch: true,
                browsers: ['Chrome']
            },
            release: {
                configFile: 'karma-minified.conf.js',
                runnerPort: 9999,
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'ziggy/src/Util.js',
                    'ziggy/src/IdFactory.js',
                    'ziggy/src/FormModelMapper.js',
                    'ziggy/src/EntityRelationshipLoader.js',
                    'ziggy/src/Entity.js',
                    'ziggy/src/Entities.js',
                    'ziggy/src/EntityDef.js',
                    'ziggy/src/EntityDefinitions.js',
                    'ziggy/src/RelationKind.js',
                    'ziggy/src/EntityRelationships.js',
                    'ziggy/src/FormDefinitionLoader.js',
                    'ziggy/src/SqlQueryBuilder.js',
                    'ziggy/src/FormDataRepository.js',
                    'ziggy/src/FormSubmissionRouter.js',
                    'ziggy/src/FormDataController.js'
                ],
                dest: 'output/ziggy.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'output/ziggy.js',
                dest: 'output/ziggy.min.js'
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: '../../main',
                    baseUrl: 'ziggy/src',
                    mainConfigFile: "main.js",
                    findNestedDependencies: true,
                    include: ['../../node_modules/requirejs/require.js'],
                    out: "output/ziggy.min.js",
                    optimize: "uglify"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['clean', 'jshint', 'karma:dev', 'requirejs']);

};