;(function($, ns) {
    ns.WorkspaceShowPage = chorus.pages.Base.extend({
//        crumbs : [
//            { label: t("breadcrumbs.home"), url: "/" },
//            { label: t("breadcrumbs.workspaces") }
//        ],

        setup : function(args) {
            this.model = new chorus.models.Workspace({id : args[0]});
//            this.model.fetch();
//            this.mainContent = new chorus.views.WorkspaceDetail({model : this.model});
            this.mainContent = new chorus.views.StaticTemplate("dashboard_sidebar");
            this.sidebar = new chorus.views.StaticTemplate("dashboard_sidebar");
        }
    });
})(jQuery, chorus.pages);