(function() {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs: function() {
            return [
                {label: t("breadcrumbs.home"), url: "#/"},
                {label: t("breadcrumbs.workspaces"), url: '#/workspaces'},
                {label: this.model.displayShortName(), url: this.model.showUrl()},
                {label: t("breadcrumbs.workspaces_data"), url: this.model.showUrl() + "/datasets"},
                {label: this.options.objectName}
            ];
        }
    });

    chorus.pages.DatasetShowPage = chorus.pages.DatabaseObjectShowPage.extend({
        helpId: "dataset",
        hideDeriveChorusView: false,

        title: function() {
            return this.objectName
        },

        setup: function(workspaceId, datasetId) {
            this.datasetId = datasetId;

            var id = datasetId.split("|");
            this.instanceId = id[0];
            this.databaseName = id[1];
            this.schemaName = id[2];
            this.objectType = id[3];
            this.objectName = id[4];

            this.workspace = new chorus.models.Workspace({id: workspaceId});
            this.workspace.bind("loaded", this.fetchDataSet, this);
            this.workspace.fetch();

            this.breadcrumbs = new breadcrumbsView({model: this.workspace, objectName: this.objectName});
        },

        fetchDataSet: function() {
            this.model = this.tabularData = new chorus.models.Dataset({ workspace: { id: this.workspace.get("id") }, id: this.datasetId });
            this.tabularData.bind("loaded", this.fetchColumnSet, this);
            this.tabularData.fetch();
        },

        fetchColumnSet: function() {
            this.columnSet = this.tabularData.columns({type: "meta"});
            this.columnSet.bind("loaded", this.columnSetFetched, this);
            this.columnSet.fetchAll();
        },

        columnSetFetched: function() {
            this.subNav = new chorus.views.SubNav({workspace: this.workspace, tab: "datasets"});

            this._super('columnSetFetched');

            this.mainContent.contentDetails.bind("dataset:edit", this.editChorusView, this);
        },

        editChorusView: function() {
            this.mainContent = new chorus.views.MainContentView({
                content: new chorus.views.DatasetEditChorusView({model: this.tabularData}),
                contentDetails: new chorus.views.DatasetContentDetails({ tabularData: this.tabularData, collection: this.columnSet, inEditChorusView: true })
            });

            this.mainContent.contentDetails.bind("dataset:cancelEdit", this.fetchDataSet, this);
            this.mainContent.contentDetails.forwardEvent("dataset:saveEdit", this.mainContent.content, this);

            this.renderSubview('mainContent');
        },

        constructSidebarForType: function(type) {
            switch (type) {
                case 'chorus_view':
                    this.tabularData.setDatasetNumber(1);
                    this.sidebar.disabled = true;
                    this.mainContent.content.selectMulti = true;
                    this.mainContent.content.showDatasetName = true;
                    this.mainContent.content.render();
                    this.mainContent.content.selectNone();
                    this.secondarySidebar = new chorus.views.CreateChorusViewSidebar({model: this.model, aggregateColumnSet: this.columnSet});
                    break;
                case 'edit_chorus_view':
                    this.secondarySidebar = new chorus.views.DatasetEditChorusViewSidebar({model: this.model});
                    break;
                default:
                    this._super('constructSidebarForType', arguments);
            }
        },

        hideSidebar: function(type) {
            this.tabularData.clearDatasetNumber();
            this.columnSet.reset(this.tabularData.columns().models);
            this.mainContent.content.selectMulti = false;
            this.mainContent.content.showDatasetName = false;
            this._super('hideSidebar', arguments);
        },

        removeOldSecondaryClasses: function(type) {
            this.$('.sidebar_content.secondary').removeClass("dataset_visualization_" + type + "_sidebar");
            this.$('.sidebar_content.secondary').removeClass("dataset_create_" + type + "_sidebar");
        }
    });
})();
