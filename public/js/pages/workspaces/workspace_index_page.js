;(function($, ns) {
    var workspaceMainContent = chorus.views.MainContentView.extend({
        setup: function(options) {
            var collection = this.collection;

            this.content = new chorus.views.WorkspaceList({collection: collection});
            this.contentHeader = new chorus.views.WorkspaceIndexContentHeader();
            this.contentDetails = new chorus.views.ListContentDetails({collection: collection, modelClass: "Workspace"});

            this.setupEvents();
            this.contentHeader.choose("active");
        },

        setupEvents: function() {
            this.contentHeader.bind("filter:all", function() {
                this.content.setFilter("all");
            }, this);
            this.contentHeader.bind("filter:active", function() {
                this.content.setFilter("active");
            }, this);
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
