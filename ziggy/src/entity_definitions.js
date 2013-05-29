if (typeof enketo === "undefined" || !enketo) {
    var enketo = {};
}

enketo.EntityDefinitions = function () {
    "use strict";

    var self = this;

    self.entityDefinitions = [];

    self.add = function (entityDefinition) {
        self.entityDefinitions.push(entityDefinition);
        return self;
    };

    self.findEntityByType = function (type) {
        for (var index = 0; index < self.entityDefinitions.length; index++) {
            if (self.entityDefinitions[index].type === type) {
                return self.entityDefinitions[index];
            }
        }
        return null;
    };

    self.hasEntityDefinitions = function () {
        return self.entityDefinitions.length !== 0
    };
};