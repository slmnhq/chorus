chorus.pages.KaggleShowPage = chorus.pages.Base.extend({

    setup: function(workspaceId) {
        this.workspaceId = workspaceId;
        this.workspace = new chorus.models.Workspace({ id: workspaceId });
        var that = this;
        this.dependOn(this.workspace);
        this.workspace.fetch();
        this.collection = new chorus.collections.KaggleUserSet();
        this.collection.fetch();

        this.mainContent = new chorus.views.MainContentList({
            modelClass:"KaggleUser",
            collection:this.collection,
            contentHeader: new chorus.views.KaggleHeader()
        });

        this.sidebar = new chorus.views.KaggleUserSidebar();
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