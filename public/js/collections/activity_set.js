chorus.collections.ActivitySet = chorus.collections.Base.extend({
    model:chorus.models.Activity,
    urlTemplate:"activitystream/{{entityType}}/{{entityId}}"
});
