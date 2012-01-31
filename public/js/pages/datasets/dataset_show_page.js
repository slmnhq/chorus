(function () {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs:function () {
            return [
                {label:t("breadcrumbs.home"), url:"#/"},
                {label:t("breadcrumbs.workspaces"), url:'#/workspaces'},
                {label:this.model.displayShortName(), url:this.model.showUrl()},
                {label:t("breadcrumbs.workspaces_data"), url:this.model.showUrl() + "/data"},
                {label:this.options.objectName}
            ];
        }
    });

    chorus.pages.DatasetShowPage = chorus.pages.Base.extend({
        setup:function (workspaceId, datasetType, objectType, objectName) {
            this.datasetType = datasetType;
            this.objectType = objectType;
            this.objectName = objectName;

            this.workspace = new chorus.models.Workspace({id:workspaceId});
            this.workspace.bind("loaded", this.fetchColumnSet, this);
            this.workspace.fetch();

            this.breadcrumbs = new breadcrumbsView({model:this.workspace, objectName:this.objectName});
        },

        fetchColumnSet:function () {
            this.model = this.dataset = new chorus.models.Dataset({
                instance:{ id:this.workspace.sandbox().get("instanceId") },
                databaseName:this.workspace.sandbox().get("databaseName"),
                schemaName:this.workspace.sandbox().get("schemaName"),
                type:this.datasetType.toUpperCase(),
                objectType:this.objectType.toUpperCase(),
                objectName:this.objectName
            });


            var options = {
                instanceId:this.workspace.sandbox().get("instanceId"),
                databaseName:this.workspace.sandbox().get("databaseName"),
                schemaName:this.workspace.sandbox().get("schemaName")
            };

            options[this.dataset.metaType() + "Name"] = this.objectName;

            this.columnSet = new chorus.collections.DatabaseColumnSet([], options);
            this.columnSet.bind("loaded", this.columnSetFetched, this);
            this.columnSet.fetchAll();
        },

        columnSetFetched:function () {

            this.subNav = new chorus.views.SubNav({workspace:this.workspace, tab:"datasets"});
            this.mainContent = new chorus.views.MainContentList({
                modelClass:"DatabaseColumn",
                collection:this.columnSet,
                model:this.workspace,
                title:this.objectName,
                imageUrl:this.dataset.iconUrl(),
                contentDetails:new chorus.views.DatasetContentDetails({ collection:this.columnSet })
            });

            this.sidebar = new chorus.views.DatasetListSidebar();
            this.sidebar.setDataset(this.dataset);

            this.mainContent.contentDetails.bind("transform:visualize", this.showVisualizeSidebar, this);

            this.render();

        },

        showVisualizeSidebar : function() {
            this.sidebar = new chorus.views.DatasetVisualizationSidebar({collection: this.columnSet})
            this.render();
        }
    });
})();
