;(function($, ns) {
    ns.WorkfileIndexPage = chorus.pages.Base.extend({
        setup : function(workspaceId) {
            // chorus.router supplies arguments to setup

            var workspace = new chorus.models.Workspace({id: workspaceId});
            workspace.fetch();
            this.breadcrumbs = new chorus.views.WorkspaceBreadcrumbsView({model: workspace});

            this.collection = new chorus.models.WorkfileSet([], {workspaceId: workspaceId});
            this.collection.fetch();
            this.subNav = new chorus.views.SubNav({workspace: workspace, tab: "workfiles"});
            this.mainContent = new chorus.views.MainContentList({modelClass : "Workfile", collection : this.collection, model : workspace});
            this.sidebar = new chorus.views.WorkfileListSidebar({model : workspace});

            this.mainContent.content.bind("workfile:selected", function(workfileId) {
                this.sidebar.trigger("workfile:selected", workfileId)
            }, this)
        }
    });
})(jQuery, chorus.pages);
