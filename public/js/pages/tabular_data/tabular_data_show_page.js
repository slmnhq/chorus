(function() {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs: function() {
            return [
                {label: t("breadcrumbs.home"), url: "#/"},
                {label: t("breadcrumbs.instances"), url: '#/instances'},
                {label: this.model.get("instance").name, dialog: "BrowseDatasets", data: { instance: this.model.get('instance')} },
                {label: this.model.get("databaseName"), dialog: "BrowseDatasets", data: { instance: this.model.get('instance'), databaseName: this.model.get("databaseName")} },
                {label: this.model.get("schemaName"), url: this.model.schema().showUrl()},
                {label: this.model.get("objectName")}
            ];
        }
    });

    var headerView = chorus.views.ListHeaderView.extend({
        postRender: function() {
            this._super('postRender', arguments);
            this.$('.menus').after(chorus.helpers.usedInWorkspaces(this.model.get("workspaceUsed")));
        }
    })

    chorus.pages.TabularDataShowPage = chorus.pages.Base.extend({
        constructorName: "TabularDataShowPage",
        helpId: "databaseObject",
        hideDeriveChorusView: true,
        additionalClass: 'tabular_data_show',
        sidebarOptions: {browsingSchema: true},

        title: function() {
            return this.tabularData.get('objectName')
        },

        setup: function() {
            this.makeModel.apply(this, arguments)
            this.fetchTabularData();
            this.makeBreadcrumbs();
        },

        makeBreadcrumbs: function() {
            this.breadcrumbs = new breadcrumbsView({model: this.tabularData});
        },

        makeModel: function(instanceId, databaseName, schemaName, objectType, objectName) {
            this.model = this.tabularData = new chorus.models.DatabaseObject({
                instance: {
                    id: instanceId
                },
                databaseName: databaseName,
                schemaName: schemaName,
                objectType: objectType,
                objectName: objectName
            })
        },

        fetchTabularData: function() {
            this.tabularData.bindOnce("loaded", this.fetchColumnSet, this);
            this.tabularData.fetch();
        },

        fetchColumnSet: function() {
            this.columnSet = this.tabularData.columns({type: "meta"});
            this.columnSet.bind("loaded", this.columnSetFetched, this);
            this.columnSet.fetchAll();
        },

        bindCallbacks: function() {
            this._super('bindCallbacks');
            chorus.PageEvents.subscribe("cancel:sidebar", this.hideSidebar, this);
        },

        postRender: function() {
            chorus.menu(this.$('.found_in .open_other_menu'), {
                content: this.$('.found_in .other_menu')
            });
        },

        columnSetFetched: function() {
            this.columnSet = new chorus.collections.DatabaseColumnSet(this.columnSet.models);
            this.columnSet.loaded = true;
            var customHeaderView = new headerView({model: this.tabularData, title: this.title(), imageUrl: this.tabularData.iconUrl()});
            this.mainContent = new chorus.views.MainContentList({
                modelClass: "DatabaseColumn",
                collection: this.columnSet,
                persistent: true,
                contentHeader: customHeaderView,
                contentDetails: new chorus.views.TabularDataContentDetails({ tabularData: this.tabularData, collection: this.columnSet, hideDeriveChorusView: this.hideDeriveChorusView })
            });

            this.mainContent.contentDetails.options.$columnList = $(this.mainContent.content.el);
            this.sidebar = new chorus.views.TabularDataListSidebar(this.sidebarOptions);
            this.sidebar.setTabularData(this.tabularData);

            this.mainContent.contentDetails.bind("transform:sidebar", this.showSidebar, this);
            this.mainContent.contentDetails.bind("column:select_all", this.mainContent.content.selectAll, this.mainContent.content);
            this.mainContent.contentDetails.bind("column:select_none", this.mainContent.content.deselectAll, this.mainContent.content);
            this.mainContent.content.bind("column:selected", this.forwardSelectedToSidebar, this);
            this.mainContent.content.bind("column:deselected", this.forwardDeselectedToSidebar, this);

            this.render();
        },

        forwardSelectedToSidebar: function(column) {
            if (this.secondarySidebar) {
                this.secondarySidebar.trigger("column:selected", column);
            }
        },

        forwardDeselectedToSidebar: function(column) {
            if (this.secondarySidebar) {
                this.secondarySidebar.trigger("column:deselected", column);
            }
        },

        showSidebar: function(type) {
            this.$('.sidebar_content.primary').addClass("hidden")
            this.$('.sidebar_content.secondary').removeClass("hidden")

            if (this.secondarySidebar) {
                this.secondarySidebar.cleanup()
                delete this.secondarySidebar;
            }

            this.mainContent.content.selectMulti = false;
            this.constructSidebarForType(type);

            if (this.secondarySidebar) {
                this.secondarySidebar.filters = this.mainContent.contentDetails.filterWizardView;
                this.secondarySidebar.errorContainer = this.mainContent.contentDetails;
                this.renderSubview('secondarySidebar');
                this.trigger('resized');
            }
        },

        constructSidebarForType: function(type) {
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
            }
        },

        hideSidebar: function(type) {
            this.sidebar.disabled = false;
            this.secondarySidebar.cleanup();
            delete this.secondarySidebar;
            this.mainContent.content.render();
            this.$('.sidebar_content.primary').removeClass("hidden")
            this.$('.sidebar_content.secondary').addClass("hidden")
            this.removeOldSecondaryClasses(type);
            this.trigger('resized');
        },

        removeOldSecondaryClasses: function(type) {
            this.$('.sidebar_content.secondary').removeClass("dataset_visualization_" + type + "_sidebar");
        }
    });
})();
