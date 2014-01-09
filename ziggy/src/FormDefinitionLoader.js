define(function () {
    "use strict";

    return {
        load: function (formName) {
            return JSON.parse(ziggyFileLoader.loadAppData(formName + "/form_definition.json"));
        }
    };
});