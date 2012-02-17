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

    chorus.pages.DatasetShowPage = chorus.pages.Base.extend({
        helpId: "dataset",

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

            chorus.PageEvents.subscribe("cancel:sidebar", this.hideSidebar, this);
        },

        fetchDataSet: function() {
            this.model = this.dataset = new chorus.models.Dataset({ workspace: { id: this.workspace.get("id") }, id: this.datasetId });
            this.dataset.datasetNumber = 1;
            this.dataset.bind("loaded", this.fetchColumnSet, this);
            this.dataset.fetch();
        },

        fetchColumnSet: function() {
            this.columnSet = this.dataset.columns({type: "meta"});
            this.columnSet.bind("loaded", this.columnSetFetched, this);
            this.columnSet.fetchAll();
        },

        columnSetFetched: function() {

            this.subNav = new chorus.views.SubNav({workspace: this.workspace, tab: "datasets"});
            this.mainContent = new chorus.views.MainContentList({
                modelClass: "DatabaseColumn",
                collection: this.columnSet,
                model: this.workspace,
                title: this.objectName,
                imageUrl: this.dataset.iconUrl(),
                contentDetails: new chorus.views.DatasetContentDetails({ dataset: this.dataset, collection: this.columnSet })
            });

            this.sidebar = new chorus.views.DatasetListSidebar();
            this.sidebar.setDataset(this.dataset);

            this.mainContent.contentDetails.bind("transform:sidebar", this.showSidebar, this);
            this.mainContent.contentDetails.bind("cancel:sidebar", this.hideSidebar, this);
            this.mainContent.contentDetails.bind("column:select_all", this.mainContent.content.selectAll, this.mainContent.content);
            this.mainContent.contentDetails.bind("column:select_none", this.mainContent.content.deselectAll, this.mainContent.content);
            this.mainContent.contentDetails.bind("dataset:edit", this.editChorusView, this);
            this.mainContent.content.bind("column:selected", this.forwardSelectedToSidebar, this);
            this.mainContent.content.bind("column:deselected", this.forwardDeselectedToSidebar, this);

            this.render();
        },

        editChorusView: function() {
            this.mainContent = new chorus.views.MainContentView({
               content: new chorus.views.DatasetEditChorusView({model: this.dataset}),
               contentDetails: new chorus.views.DatasetContentDetails({ dataset: this.dataset, collection: this.columnSet, inEditChorusView: true })
            });

            this.mainContent.contentDetails.bind("dataset:cancelEdit", this.fetchDataSet, this);
            this.mainContent.contentDetails.forwardEvent("dataset:saveEdit", this.mainContent.content, this);

            this.renderSubview('mainContent');
        },

        forwardSelectedToSidebar : function(column) {
            if (this.secondarySidebar) {
                this.secondarySidebar.trigger("column:selected", column);
            }
        },

        forwardDeselectedToSidebar : function(column) {
            if (this.secondarySidebar) {
                this.secondarySidebar.trigger("column:deselected", column);
            }
        },
        
        forwardDeselectedToMain : function(column) {
            this.mainContent.content.trigger("column:deselected", column);
        },

        showSidebar: function(type) {
            this.$('.sidebar_content.primary').addClass("hidden")
            this.$('.sidebar_content.secondary').removeClass("hidden")

            if (this.secondarySidebar) {
                chorus.PageEvents.unsubscribe(this.secondarySidebar.selectedHandle);
                chorus.PageEvents.unsubscribe(this.secondarySidebar.deselectedHandle);
                chorus.PageEvents.unsubscribe(this.secondarySidebar.cancelVisualization);
            }

            this.mainContent.content.selectMulti = false;
            switch (type) {
                case 'boxplot':
                    this.secondarySidebar = new chorus.views.DatasetVisualizationBoxplotSidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'frequency':
                    this.secondarySidebar = new chorus.views.DatasetVisualizationFrequencySidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'histogram':
                    this.secondarySidebar = new chorus.views.DatasetVisualizationHistogramSidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'heatmap':
                    this.secondarySidebar = new chorus.views.DatasetVisualizationHeatmapSidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'timeseries':
                    this.secondarySidebar = new chorus.views.DatasetVisualizationTimeSeriesSidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'chorus_view':
                    this.mainContent.content.selectMulti = true;
                    this.mainContent.content.selectNone();
                    this.secondarySidebar = new chorus.views.CreateChorusViewSidebar({model : this.model});
                    break;
                case 'edit_chorus_view':
                    this.secondarySidebar = new chorus.views.DatasetEditChorusViewSidebar({model: this.model, sandbox: this.workspace.sandbox()});
                    break;
            }

            this.secondarySidebar.filters = this.mainContent.contentDetails.filterWizardView;
            this.secondarySidebar.errorContainer = this.mainContent.contentDetails;
            this.renderSubview('secondarySidebar');
            this.trigger('resized');
        },

        hideSidebar: function(type) {
            this.mainContent.content.selectMulti = false;
            this.mainContent.content.render();
            this.$('.sidebar_content.primary').removeClass("hidden")
            this.$('.sidebar_content.secondary').addClass("hidden")
            this.removeOldSecondaryClasses(type);
            this.trigger('resized');
        },

        removeOldSecondaryClasses: function(type) {
            this.$('.sidebar_content.secondary').removeClass("dataset_visualization_" + type + "_sidebar");
            this.$('.sidebar_content.secondary').removeClass("dataset_create_" + type + "_sidebar");
        }
    });
})();
