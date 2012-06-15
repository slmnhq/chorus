chorus.collections.MemberSet = chorus.collections.Base.extend({
    constructorName: "MemberSet",
    model:chorus.models.User,
    urlTemplate:"workspaces/{{workspaceId}}/members",

    save: function() {
        new chorus.models.BulkSaver({collection: this}).save();
    },

    urlParams: function() {
        var ids = _.pluck(this.models, 'id');
        return { 'memberIds[]': ids };
    }
});
