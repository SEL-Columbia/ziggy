define(function () {
    // String format
    if (!String.prototype.format) {
        String.prototype.format = function () {
            "use strict";
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] !== 'undefined' ? args[number] : match;
            });
        };
    }

    return {
        hasValue: function (object) {
            "use strict";
            return !(typeof object === "undefined" || !object);
        }
    };
});


