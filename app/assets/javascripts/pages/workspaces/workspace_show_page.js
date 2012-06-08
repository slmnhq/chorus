chorus.pages.WorkspaceShowPage = chorus.pages.Base.extend({
    helpId: "workspace_summary",

    setup: function(workspaceId) {
        this.workspaceId = workspaceId;
        this.model = new chorus.models.Workspace({ id: workspaceId });
        var that = this;
        this.model.onLoaded(function() { that.decideIfQuickstart(); });
        this.dependOn(this.model);
        this.model.fetch();

        this.subNav = new chorus.views.SubNav({workspace: this.model, tab: "summary"})
        this.sidebar = new chorus.views.WorkspaceShowSidebar({model: this.model});

        this.mainContent = new chorus.views.MainContentView({
            model: this.model,
            content: new chorus.views.WorkspaceShow({model: this.model }),
            contentHeader: new chorus.views.WorkspaceSummaryContentHeader({model: this.model})
        });
    },

    decideIfQuickstart: function() {
        if (this.model.owner().get("id") === chorus.session.user().get("id")){
            if (!this.quickstartNavigated && (
                this.model.get("hasAddedMember") == false ||
                this.model.get("hasAddedWorkfile") == false ||
                this.model.get("hasAddedSandbox") == false ||
                this.model.get("hasChangedSettings") == false)) {

                chorus.router.navigate("/workspaces/" + this.workspaceId + "/quickstart");
                return;
            }
        }
    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.workspaces"), url: "#/workspaces"},
            {label: this.model && this.model.loaded ? this.model.displayShortName() : "..."}
        ];
    }
});
