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
            var workspace = new chorus.models.Workspace({id: workspaceId});
            workspace.fetch();
            this.breadcrumbs = new breadcrumbsView({model: workspace});

            this.collection = new chorus.models.DatasetSet([], {workspaceId: workspaceId});
            this.collection.fetch();

            this.subNav = new chorus.views.SubNav({workspace: workspace, tab: "datasets"});
            this.mainContent = new chorus.views.MainContentList({
                modelClass : "Dataset",
                collection : this.collection,
                model : workspace
            });

            this.sidebar = new chorus.views.DatasetListSidebar();

            this.mainContent.content.forwardEvent("dataset:selected", this.sidebar);
        }
    });
})(jQuery, chorus.pages);
