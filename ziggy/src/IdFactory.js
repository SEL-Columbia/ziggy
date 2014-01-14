define(['IdFactoryBridge'], function (IdFactoryBridge) {
    "use strict";
    return{
        generateIdFor: function (entityType) {
            return IdFactoryBridge.generateIdFor(entityType);
        }
    };
});