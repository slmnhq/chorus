;(function($, ns) {
    var breadcrumbsView = ns.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs : function(){
            return [
                    {label: t("breadcrumbs.home"), url: "#/"},
                    {label: t("breadcrumbs.workspaces"), url: "#/workspaces"},
                    {label: this.model.displayShortName()}
                ];
        }
    });

    ns.pages.WorkspaceSummaryPage = chorus.pages.Base.extend({
        setup : function(workspaceId) {
            // chorus.router supplies arguments to setup
            this.model = new chorus.models.Workspace({id : workspaceId});
            this.model.fetch();
            this.breadcrumbs = new breadcrumbsView({model: this.model});
            this.subNav = new chorus.views.SubNav({workspace : this.model, tab: "summary"})
            this.sidebar = new chorus.views.WorkspaceSummarySidebar({model: this.model});

            this.mainContent = new chorus.views.MainContentView({
                model: this.model,
                content : new chorus.views.WorkspaceDetail({model: this.model }),
                contentHeader : new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters: 300, lines: 2})
            });
        }
    });
})(jQuery, chorus);
