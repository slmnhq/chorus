;(function($, ns) {
    ns.WorkspaceSummaryPage = chorus.pages.Base.extend({
        crumbs : function() {
            return [
                { label: t("breadcrumbs.home"), url: "#/" },
                { label: this.model.get("name") }
            ]
        },

        setup : function(workspaceId) {
            // chorus.router supplies arguments to setup
            this.model = new chorus.models.Workspace({id : workspaceId});
            this.model.fetch();
            this.breadcrumbs = new chorus.views.WorkspaceBreadcrumbsView({model: this.model});
            this.subNav = new chorus.views.SubNav({workspace : this.model, tab: "Summary"})
            this.sidebar = new chorus.views.WorkspaceSummarySidebar({model: this.model});

            this.mainContent = new chorus.views.MainContentView({
                model: this.model,
                content : new chorus.views.WorkspaceDetail({model: this.model }),
                contentHeader : new chorus.views.StaticTemplate("plain_text", {text: "Summary"}),
            });
        }
    });
})(jQuery, chorus.pages);
