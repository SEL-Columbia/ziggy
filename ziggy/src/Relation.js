define(function () {

    var Relation = function (type, kind, as, from, to) {
        "use strict";

        var self = this;

        self.type = type;
        self.kind = kind;
        self.as = as;
        self.from = from;
        self.to = to;
    };

    return {
        newInstance: function (type, kind, as, from, to) {
            return new Relation(type, kind, as, from, to);
        }
    };
});