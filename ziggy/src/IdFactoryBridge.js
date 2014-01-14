define(['formDataRepositoryContext'], function () {
    "use strict";
    var idFactoryContext;
    if (typeof formDataRepositoryContext !== "undefined") {
        idFactoryContext = formDataRepositoryContext;
    }

    return {
        generateIdFor: function (entityType) {
            return idFactoryContext.generateIdFor(entityType);
        }
    };
});