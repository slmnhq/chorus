chorus.collections.MemberSet = chorus.collections.Base.extend({
    constructorName: "MemberSet",
    model:chorus.models.User,
    urlTemplate:"workspaces/{{workspaceId}}/members",

    save: function() {
        var self = this;

        Backbone.sync('create', this, {
            data: this.toUrlParams(),
            success: function(resp, status, xhr) {
                self.trigger("saved");
            },
            error: function() {
                self.trigger("saveFailed");
            }
        });
    },

    toUrlParams:function () {
        var ids = _.pluck(this.models, 'id');
        return $.param({ member_ids : ids});
    }
});
