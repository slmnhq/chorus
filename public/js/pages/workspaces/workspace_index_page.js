;(function($, ns) {
    var workspaceMainContent = chorus.views.MainContentView.extend({
        setup: function(options) {
            var collection = this.collection;

            this.content = new chorus.views.WorkspaceList({collection: collection});
            this.contentHeader = new chorus.views.WorkspaceIndexContentHeader();
            this.contentDetails = new chorus.views.Count({collection: collection, modelClass: "Workspace"});
        }
    });

    ns.pages.WorkspaceIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home"), url: "/" },
            { label: t("breadcrumbs.workspaces") }
        ],

        setup : function() {
            this.collection = new chorus.models.WorkspaceSet();
            this.collection.fetch();
            this.mainContent = new workspaceMainContent({collection : this.collection})
            this.sidebar = new chorus.views.StaticTemplate("dashboard_sidebar");
        }
    });
})(jQuery, chorus);
