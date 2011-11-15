;(function($, ns) {
    ns.WorkspaceShowPage = chorus.pages.Base.extend({
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
            this.mainContent = new chorus.views.SubNavContent({modelClass : "Workspace", tab : "summary", model : this.model});
        }
    });
})(jQuery, chorus.pages);