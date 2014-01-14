define(function () {
    "use strict";

    return {
        load: function () {
            return JSON.parse(ziggyFileLoader.loadAppData("entity_relationship.json"));
        }

    };
});