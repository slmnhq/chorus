chorus.collections.MemberSet = chorus.collections.Base.extend({
    constructorName: "MemberSet",
    model:chorus.models.User,
    urlTemplate:"workspace/{{workspaceId}}/member",

    save: function() {
        var self = this;

        Backbone.sync('update', this, {
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
        return this.map(function(model) {
            return "members=" + model.id;
        }).join("&");
    }
});
