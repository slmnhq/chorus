chorus.pages.KaggleUserIndexPage = chorus.pages.Base.extend({
    constructorName: "KaggleUserIndexPage",
    additionalClass: 'kaggle_user_list',


    setup: function(workspaceId) {
        this.workspaceId = workspaceId;
        this.workspace = new chorus.models.Workspace({ id: workspaceId });
        var that = this;
        this.dependOn(this.workspace);
        this.workspace.fetch();
        this.collection = new chorus.collections.KaggleUserSet([], {workspace: this.workspace});
        this.collection.fetch();

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "KaggleUser",
            collection: this.collection,
            contentHeader: new chorus.views.KaggleHeader(),
            contentDetails : new chorus.views.KaggleUserListContentDetails({collection: this.collection})
        });

        this.sidebar = new chorus.views.KaggleUserSidebar({workspace: this.workspace});
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