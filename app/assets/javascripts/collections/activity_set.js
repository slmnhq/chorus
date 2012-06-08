;(function() {

    var DASHBOARD = "dashboard";

    chorus.collections.ActivitySet = chorus.collections.Base.extend({
        constructorName: "ActivitySet",
        model: chorus.models.Activity,

        urlTemplate: function() {
            if (this.attributes.insights) {
                return "commentinsight/"
            } else if (this.attributes.entityType === DASHBOARD) {
                return "activities"
            } else {
                return "{{entityType}}/{{entityId}}/activities"
            }
        }
    }, {
        forDashboard: function() {
            return new chorus.collections.ActivitySet([], { entityType: DASHBOARD });
        }
    });

})();
