(function () {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs:function () {
            return [
                {label:t("breadcrumbs.home"), url:"#/"},
                {label:t("breadcrumbs.workspaces"), url:"#/workspaces"},
                {label:this.model.displayShortName()}
            ];
        }
    });

    chorus.pages.WorkspaceShowPage = chorus.pages.Base.extend({
        helpId: "workspace_summary",

        setup:function (workspaceId) {
            this.workspaceId = workspaceId;
            this.model = new chorus.models.Workspace({id:workspaceId});
            this.model.fetch();
            this.requiredResources.push(this.model);
            this.breadcrumbs = new breadcrumbsView({model:this.model});
            this.subNav = new chorus.views.SubNav({workspace:this.model, tab:"summary"})
            this.sidebar = new chorus.views.WorkspaceShowSidebar({model:this.model});

            this.mainContent = new chorus.views.MainContentView({
                model:this.model,
                content:new chorus.views.WorkspaceShow({model:this.model }),
                contentHeader:new chorus.views.WorkspaceSummaryContentHeader({model:this.model})
            });
        }
    });
})();
