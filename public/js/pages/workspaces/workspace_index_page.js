(function($, ns) {
    ns.WorkspaceIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: "Home", url: "/" },
            { label: "Workspaces" }
        ],

        setup : function() {
            this.mainContent = new chorus.views.ListView({modelClass : "Workspace"})
            this.sidebar = new chorus.views.StaticTemplate("dashboard_sidebar");
        }
    });
})
    (jQuery, chorus.pages);
