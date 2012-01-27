;
(function($, ns) {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs : function(){
            return [
                    {label: t("breadcrumbs.home"), url: "#/"},
                    {label: t("breadcrumbs.workspaces"), url: '#/workspaces'},
                    {label: this.model.displayShortName(), url: this.model.showUrl()},
                    {label: t("breadcrumbs.workspaces_data")}
                ];
        }
    });

    ns.DatasetIndexPage = chorus.pages.Base.extend({
        setup : function(workspaceId) {
            this.workspace = new chorus.models.Workspace({id: workspaceId});
            this.workspace.fetch();
            this.breadcrumbs = new breadcrumbsView({model: this.workspace});

            this.collection = new chorus.collections.DatasetSet([], {workspaceId: workspaceId});
            this.collection.sortAsc("objectName");
            this.collection.fetch();

            this.subNav = new chorus.views.SubNav({workspace: this.workspace, tab: "datasets"});
            this.mainContent = new chorus.views.MainContentList({
                modelClass : "Dataset",
                collection : this.collection,
                model : this.workspace
            });

            this.sidebar = new chorus.views.DatasetListSidebar();

            this.mainContent.content.forwardEvent("dataset:selected", this.sidebar);
            this.mainContent.content.bind("dataset:selected", function(dataset) {
                this.model = dataset;
            }, this);
        }
    });
})(jQuery, chorus.pages);
