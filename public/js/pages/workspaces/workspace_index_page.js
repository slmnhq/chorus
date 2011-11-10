(function($, ns) {
    ns.WorkspaceIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: "Home", url: "/" },
            { label: "Workspaces" }
        ],

        setup : function() {
            this.mainContent = new chorus.views.WorkspaceIndexMain()
            this.sidebar = new chorus.views.StaticTemplate("dashboard_sidebar");
        }
    });


    chorus.views.WorkspaceIndexMain = chorus.views.ListView.extend({
        modelClass : "Workspace"
    })
})
    (jQuery, chorus.pages);
