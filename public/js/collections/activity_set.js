(function(ns) {
    ns.ActivitySet = ns.Collection.extend({
        model : ns.Activity,
        urlTemplate : "activitystream/{{entityType}}/{{entityId}}"
    });
})(chorus.models);
