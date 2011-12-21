;
(function($, ns) {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs : function(){
            return [
                    {label: t("breadcrumbs.home"), url: "#/"},
                    {label: this.model.get("name"), url: this.model.showUrl()},
                    {label: t("breadcrumbs.workfiles.all")}
                ];
        }
    });

    ns.WorkfileIndexPage = chorus.pages.Base.extend({
        setup : function(workspaceId) {
            // chorus.router supplies arguments to setup

            var workspace = new chorus.models.Workspace({id: workspaceId});
            workspace.fetch();
            this.breadcrumbs = new breadcrumbsView({model: workspace});

            this.collection = new chorus.models.WorkfileSet([], {workspaceId: workspaceId});
            this.collection.fileType = "";
            this.collection.sortAsc("fileName");
            this.collection.fetch();
            this.subNav = new chorus.views.SubNav({workspace: workspace, tab: "workfiles"});
            this.mainContent = new chorus.views.MainContentList({
                    modelClass : "Workfile",
                    collection : this.collection,
                    model : workspace,
                    linkMenus : {
                        type : {
                            title : t("workfiles.header.menu.filter.title"),
                            options : [
                                {data : "", text : t("workfiles.header.menu.filter.all")},
                                {data : "sql", text : t("workfiles.header.menu.filter.sql")},
                                {data : "code", text : t("workfiles.header.menu.filter.code")},
                                {data : "text", text : t("workfiles.header.menu.filter.text")},
                                {data : "other", text : t("workfiles.header.menu.filter.other")}
                            ],
                            event : "filter"
                        },
                        sort : {
                            title : t("workfiles.header.menu.sort.title"),
                            options : [
                                {data : "alpha", text : t("workfiles.header.menu.sort.alphabetically")},
                                {data : "date", text : t("workfiles.header.menu.sort.by_date")}
                            ],
                            event : "sort"
                        }

                    }
                }
            );
            this.sidebar = new chorus.views.WorkfileListSidebar({model : workspace});

            this.mainContent.content.forwardEvent("workfile:selected", this.sidebar);
            this.mainContent.content.bind("workfile:selected", this.setModel, this);

            this.mainContent.contentHeader.bind("choice:filter", function(choice) {
                this.collection.attributes.fileType = choice;
                this.collection.fetch();
            }, this)
            
            this.mainContent.contentHeader.bind("choice:sort", function(choice) {
                var field = choice == "alpha" ? "fileName" : "lastUpdatedStamp";
                this.collection.sortAsc(field)
                this.collection.fetch();
            }, this)
        },

        setModel: function(workfile) {
            this.model = workfile;
        }
    });
})(jQuery, chorus.pages);
