chorus.pages.KaggleShowPage = chorus.pages.Base.extend({

    setup: function(workspaceId) {
        this.workspaceId = workspaceId;
        this.workspace = new chorus.models.Workspace({ id: workspaceId });
        var that = this;
        this.dependOn(this.workspace);
        this.workspace.fetch();

        this.mainContent = new chorus.views.MainContentView({
            model: this.workspace,
//            content: new chorus.views.UserShow({model: this.model}),
            contentHeader: new chorus.views.KaggleHeader()
//            contentDetails: new chorus.views.StaticTemplate("plain_text", {text: t("users.details")})
        });

    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.workspaces"), url: "#/workspaces"},
            {label: this.workspace && this.workspace.loaded ? this.workspace.displayShortName() : "...", url: this.workspace && this.workspace.showUrl()},
            {label: "Kaggle"}
        ];
    }
});