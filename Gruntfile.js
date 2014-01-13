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
                configFile: 'ziggy/test/conf/karma-minified.conf.js',
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
                    'ziggy/src/id_factory.js',
                    'ziggy/src/form_model_mapper.js',
                    'ziggy/src/entity_relationship_loader.js',
                    'ziggy/src/Entity.js',
                    'ziggy/src/entities.js',
                    'ziggy/src/EntityDef.js',
                    'ziggy/src/EntityDefinitions.js',
                    'ziggy/src/RelationKind.js',
                    'ziggy/src/EntityRelationships.js',
                    'ziggy/src/form_definition_loader.js',
                    'ziggy/src/SqlQueryBuilder.js',
                    'ziggy/src/FormDataRepository.js',
                    'ziggy/src/form_submission_router.js',
                    'ziggy/src/form_data_controller.js'
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['clean', 'jshint', 'karma:dev', 'concat', 'uglify', 'karma:release']);

};