;(function($, ns) {
    ns.WorkfileIndexPage = chorus.pages.Base.extend({
        setup : function(workspaceId) {
            // chorus.router supplies arguments to setup

            var workspace = new chorus.models.Workspace({id: workspaceId});
            workspace.fetch();
            this.breadcrumbs = new chorus.views.WorkspaceBreadcrumbsView({model: workspace});

            this.collection = new chorus.models.WorkfileSet([], {workspaceId: workspaceId});
            this.collection.fetch();
            this.mainContent = new chorus.views.SubNavContentList({modelClass : "Workfile", tab : "workfiles", collection : this.collection, model : workspace});
            this.sidebar = new chorus.views.WorkfileCreateSidebar({model : workspace});
        }
    });
})(jQuery, chorus.pages);
