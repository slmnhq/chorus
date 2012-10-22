chorus.pages.KaggleUserIndexPage = chorus.pages.Base.extend({
    constructorName: "KaggleUserIndexPage",
    additionalClass: 'kaggle_user_list',


    setup: function(workspaceId) {
        this.workspaceId = workspaceId;
        this.workspace = new chorus.models.Workspace({ id: workspaceId });
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

        chorus.PageEvents.subscribe("filterKaggleUsers", this.filterKaggleUsers, this);
    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.workspaces"), url: "#/workspaces"},
            {label: this.workspace && this.workspace.loaded ? this.workspace.displayShortName() : "...", url: this.workspace && this.workspace.showUrl()},
            {label: "Kaggle"}
        ];
    },

    filterKaggleUsers: function(filterCollection) {
        var paramArray = _.compact(filterCollection.map(function(model) {
            return model.filterParams();
        }));
        this.collection.urlParams = {'kaggleUser[]': paramArray};
        this.collection.fetch();
    }
});