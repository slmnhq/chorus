chorus.views.UserShow = chorus.views.Base.extend({
    className:"user_show",

    additionalContext:function () {
        if (!this._fetchedWorkspaces) {
            this.model.workspaces().fetch();
            this._fetchedWorkspaces = true;
        }

        return {
            workspaces:this.model.workspaces(),
            department:this.model.get("ou"),
            imageUrl:this.model.imageUrl()
        }
    }
});