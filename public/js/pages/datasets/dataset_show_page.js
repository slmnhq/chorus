;
(function($, ns) {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs : function(){
            return [
                    {label: t("breadcrumbs.home"), url: "#/"},
                    {label: t("breadcrumbs.workspaces"), url: '#/workspaces'},
                    {label: this.model.displayShortName(), url: this.model.showUrl()},
                    {label: t("breadcrumbs.workspaces_data"), url: this.model.showUrl()+"/data"},
                    {label: this.options.objectName}
                ];
        }
    });

    ns.DatasetShowPage = chorus.pages.Base.extend({
        setup : function(workspaceId, dataType, objectName) {
            this.dataType = dataType;
            this.objectName = objectName;
            
            this.workspace = new chorus.models.Workspace({id: workspaceId});
            this.workspace.bind("loaded", this.fetchColumnSet, this);
            this.workspace.fetch();

            this.breadcrumbs = new breadcrumbsView({model: this.workspace, objectName : objectName});
        },

        fetchColumnSet : function() {
            var options = {
                instanceId : this.workspace.sandbox().get("instanceId"),
                databaseName : this.workspace.sandbox().get("databaseName"),
                schemaName : this.workspace.sandbox().get("schemaName")

            };

            if (this.dataType === "table") {
                options.tableName = this.objectName;
            } else {
                options.viewName = this.objectName;
            }
            this.columnSet = new chorus.collections.DatabaseColumnSet([], options);
            this.columnSet.bind("loaded", this.columnSetFetched, this);
            this.columnSet.fetch();
        },

        columnSetFetched : function() {
            this.subNav = new chorus.views.SubNav({workspace: this.workspace, tab: "datasets"});
//            this.mainContent = new chorus.views.MainContentList({
//                modelClass : "DatabaseColumn",
//                collection : this.columnSet,
//                model : this.workspace
//            });
//
//            this.sidebar = new chorus.views.DatasetListSidebar();
//
//            this.mainContent.content.forwardEvent("dataset:selected", this.sidebar);
            this.render();

        }
    });
})(jQuery, chorus.pages);
