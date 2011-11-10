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


    chorus.views.WorkspaceIndexMain = chorus.views.MainContentView.extend({
        setup : function() {
            var workspaceSet = new chorus.models.WorkspaceSet();
            workspaceSet.fetch();
            this.content = new chorus.views.WorkspaceSet({collection: workspaceSet })
            this.contentHeader = new chorus.views.StaticTemplate("default_content_header", {title: "Workspaces"})
            this.contentDetails = new chorus.views.WorkspaceCount({collection : workspaceSet})
        }
    })
})
    (jQuery, chorus.pages);
