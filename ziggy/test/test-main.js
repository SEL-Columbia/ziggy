var tests = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/Spec\.js$/.test(file)) {
            tests.push(file);
        }
    }
}

requirejs.config({
    // Karma serves files from '/base'
    paths: {
        'ziggy': '/base/ziggy/src',
        'Squire': '/base/node_modules/squirejs/src/Squire',
        'AsyncSpec': '/base/ziggy/test/lib/jasmine.async',
        'formDataRepositoryContext': '/base/ziggy/test/stub/formDataRepositoryContext',
        'formSubmissionRouter': '/base/ziggy/test/stub/formSubmissionRouter'
    },
    shim: {
        'AsyncSpec': {
            exports: 'AsyncSpec'
        },
        'formDataRepositoryContext': {
            exports: 'formDataRepositoryContext'
        },
        'formSubmissionRouter': {
            exports: 'formSubmissionRouter'
        }
    }
});

require(tests, function () {
    window.__karma__.start();
});