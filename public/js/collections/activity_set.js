chorus.collections.ActivitySet = chorus.collections.Base.extend({
    constructorName: "ActivitySet",
    model:chorus.models.Activity,

    urlTemplate: function() {
        if (this.attributes.insights) {
            return "commentinsight/"
        } else {
            return "activitystream/{{entityType}}/{{encodeOnce entityId}}"
        }
    },

    urlParams: function() {
        if (this.attributes.workspace) {
            return { workspaceId: this.attributes.workspace.id }
        } else {
            return {};
        }
    }
});
