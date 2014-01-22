define(['ziggy/Relation'], function (Relation) {
    "use strict";

    var RelationDef = function (type, kind, as, from, to) {

        var self = this;

        self.type = type;
        self.kind = kind;
        self.as = as;
        self.from = from;
        self.to = to;

        self.createInstance = function () {
            return Relation.newInstance(self.type, self.kind, self.as, self.from, self.to);
        };
    };

    return {
        newInstance: function (type, kind, as, from, to) {
            return new RelationDef(type, kind, as, from, to);
        }
    };
});