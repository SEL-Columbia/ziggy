define(['ziggy/Entity'], function (Entity) {
    "use strict";

    var EntityDef = function (type) {

        var self = this;

        self.type = type;
        self.relations = [];
        self.fields = [];

        self.addRelation = function (rel) {
            self.relations.push(rel);
            return self;
        };

        self.removeAllRelations = function () {
            self.relations = [];
        };

        self.createInstance = function () {
            var instance = Entity.newInstance(self.type);
            self.relations.forEach(function (rel) {
                instance.relations.push(rel.createInstance());
            });
            return instance;
        };

        self.findRelationByType = function (type) {
            return self.relations.filter(function (relation) {
                return relation.type === type;
            })[0];
        };
    };

    return {
        newInstance: function (type) {
            return new EntityDef(type);
        }
    };
});