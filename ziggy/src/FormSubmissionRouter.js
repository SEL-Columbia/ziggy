define(['formSubmissionRouter'], function (formSubmissionRouter) {
    "use strict";

    var submissionRouter;
    if (typeof formSubmissionRouter !== "undefined") {
        submissionRouter = formSubmissionRouter;
    }

    return {
        route: function (instanceId) {
            return submissionRouter.route(instanceId);
        }
    };
});