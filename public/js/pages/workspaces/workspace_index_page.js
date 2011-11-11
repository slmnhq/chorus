(function($, ns) {
    ns.WorkspaceIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: "Home", url: "/" },
            { label: "Workspaces" }
        ],

        setup : function() {
            this.collection = new chorus.models.WorkspaceSet();
            this.collection.fetch();
            this.mainContent = new chorus.views.MainContentList({modelClass : "Workspace", collection : this.collection})
            this.sidebar = new chorus.views.StaticTemplate("dashboard_sidebar");
        }
    });
})
    (jQuery, chorus.pages);
