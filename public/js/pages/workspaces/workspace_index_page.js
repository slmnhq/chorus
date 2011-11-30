;(function($, ns) {
    ns.pages.WorkspaceIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home"), url: "/" },
            { label: t("breadcrumbs.workspaces") }
        ],

        setup : function() {
            this.collection = new chorus.models.WorkspaceSet();
            this.mainContent = new chorus.views.MainContentList({
                    modelClass : "Workspace",
                    collection : this.collection,
                    linkMenus : {
                        type : {
                            title : t("filter.show"),
                            options : [
                                {data : "active", text : t("filter.active_workspaces")},
                                {data : "all", text : t("filter.all_workspaces")}
                            ],
                            event : "filter"
                        }
                    }
                }
            );
            this.sidebar = new chorus.views.StaticTemplate("dashboard_sidebar");

            this.mainContent.contentHeader.bind("choice:filter", function(choice) {
                // setup filter in collection and re-fetch
                this.mainContent.content.setFilter(choice);
//                this.collection.fetch();
            }, this)
            this.mainContent.content.setFilter("active")
            this.collection.fetch();
        }
    });
})(jQuery, chorus);
