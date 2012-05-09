chorus.collections.WorkspaceSet = chorus.collections.Base.extend({
    constructorName: "WorkspaceSet",
    model:chorus.models.Workspace,
    urlTemplate:"workspaces/",

    urlParams:function () {
        var params = {};

        if (this.attributes.active) {
            params.active = true;
        }

        if (this.attributes.userId) {
            params.user_id = this.attributes.userId;
        }

        if (this.attributes.showLatestComments) {
            params.showLatestComments = true;
        }

        return params;
    }
});
