chorus.collections.WorkspaceSet = chorus.collections.Base.extend({
    model:chorus.models.Workspace,
    urlTemplate:"workspace/",

    urlParams:function () {
        var params = {};

        if (this.attributes.active) {
            params.active = true;
        }

        if (this.attributes.userId) {
            params.user = this.attributes.userId;
        }

        if (this.attributes.showLatestComments) {
            params.showLatestComments = true;
        }

        return params;
    }
});
