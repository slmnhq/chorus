;(function($, ns) {
    ns.WorkfileIndexPage = chorus.pages.Base.extend({
        setup : function() {
            // chorus.router supplies arguments to setup
            var workspaceId = arguments[0];

            var workspace = new chorus.models.Workspace({id: workspaceId});
            workspace.fetch();
            this.breadcrumbs = new chorus.views.WorkspaceBreadcrumbsView({model: workspace});

            this.collection = new chorus.models.WorkfileSet([], {workspaceId: workspaceId});
            this.collection.fetch();
            this.mainContent = new chorus.views.MainContentList({modelClass : "Workfile", collection : this.collection})
        }
    });
})(jQuery, chorus.pages);
