chorus.pages.WorkspaceShowPage = chorus.pages.Base.extend({
    helpId: "workspace_summary",

    setup: function(workspaceId) {
        if (!this.quickstartNavigated && !chorus.views.WorkspaceQuickstart.quickstartFinishedFor(workspaceId)) {
            chorus.router.navigate("/workspaces/" + workspaceId + "/quickstart");
            return;
        }

        this.workspaceId = workspaceId;
        this.model = new chorus.models.Workspace({id: workspaceId});
        this.model.fetch();
        this.dependOn(this.model);
        this.subNav = new chorus.views.SubNav({workspace: this.model, tab: "summary"})
        this.sidebar = new chorus.views.WorkspaceShowSidebar({model: this.model});

        this.mainContent = new chorus.views.MainContentView({
            model: this.model,
            content: new chorus.views.WorkspaceShow({model: this.model }),
            contentHeader: new chorus.views.WorkspaceSummaryContentHeader({model: this.model})
        });
    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.workspaces"), url: "#/workspaces"},
            {label: this.model && this.model.loaded ? this.model.displayShortName() : "..."}
        ];
    }
});