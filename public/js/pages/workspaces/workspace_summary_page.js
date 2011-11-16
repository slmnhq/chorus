;(function($, ns) {
    ns.WorkspaceSummaryPage = chorus.pages.Base.extend({
        crumbs : function() {
            return [
                { label: t("breadcrumbs.home"), url: "/" },
                { label: this.model.get("name") }
            ]
        },

        setup : function(workspaceId) {
            // chorus.router supplies arguments to setup
            this.model = new chorus.models.Workspace({id : workspaceId});
            this.model.fetch();
            this.breadcrumbs = new chorus.views.WorkspaceBreadcrumbsView({model: this.model});
            this.mainContent = new chorus.views.SubNavContentView({
                modelClass : "Workspace",
                tab : "summary",
                model : this.model,
                content : new chorus.views.WorkspaceDetail({model: this.model })
            });
        }
    });
})(jQuery, chorus.pages);