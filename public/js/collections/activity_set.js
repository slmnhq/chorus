(function(ns) {
    ns.collections.ActivitySet = ns.collections.Base.extend({
        model : ns.models.Activity,
        urlTemplate : "activitystream/{{entityType}}/{{entityId}}"
    });
})(chorus);
