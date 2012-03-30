(function() {
    var headerView = chorus.views.ListHeaderView.extend({
        additionalContext: function() {
            return {
                importFrequency: chorus.helpers.importFrequencyForModel(this.model)
            }
        },

        postRender: function() {
            this._super('postRender', arguments);

            this.$('.menus').after(chorus.helpers.usedInWorkspaces(this.model.workspacesAssociated(), this.model.asDataset()).toString());
            if (this.model.importFrequency && this.model.importFrequency()) {
                $(this.el).addClass('has_import');
            }
        }
    });

    chorus.pages.TabularDataShowPage = chorus.pages.Base.include(
        chorus.Mixins.InstanceCredentials.page
    ).extend({
        constructorName: "TabularDataShowPage",
        helpId: "databaseObject",
        hideDeriveChorusView: true,
        additionalClass: 'tabular_data_show',
        sidebarOptions: {},
        contentDetailsOptions: {},

        failurePageOptions: function() {
            return {
                title: t("invalid_route.tabular_data.title"),
                text: t("invalid_route.tabular_data.content")
            };
        },

        title: function() {
            return this.tabularData.get('objectName')
        },

        setup: function() {
            this.makeModel.apply(this, arguments)
            this.dependOn(this.tabularData);
            this.fetchResources();
            this.mainContent = new chorus.views.LoadingSection();
        },

        crumbs: function() {
            return [
                {label: t("breadcrumbs.home"), url: "#/"},
                {label: t("breadcrumbs.instances"), url: '#/instances'},
                {label: this.tabularData.get("instance").name, url: this.tabularData.instance().databases().showUrl() },
                {label: this.tabularData.get("databaseName"),  url: this.tabularData.database().showUrl() },
                {label: this.tabularData.get("schemaName"), url: this.tabularData.schema().showUrl()},
                {label: this.tabularData.get("objectName")}
            ];
        },

        makeModel: function(instanceId, databaseName, schemaName, objectType, objectName) {
            this.model = this.tabularData = new chorus.models.DatabaseObject({
                instance: { id: instanceId },
                databaseName: decodeURIComponent(databaseName),
                schemaName:   decodeURIComponent(schemaName),
                objectName:   decodeURIComponent(objectName),
                objectType:   objectType
            });
        },

        fetchResources: function() {
            this.tabularData.fetch();
            this.bindings.add(this.tabularData, "change", this.fetchColumnSet);
        },

        fetchColumnSet: function() {
            this.columnSet = this.tabularData.columns({type: "meta"});
            this.columnSet.bind("loaded", this.drawColumns, this);
            this.columnSet.fetchAll();
        },

        bindCallbacks: function() {
            this._super('bindCallbacks');
            chorus.PageEvents.subscribe("cancel:sidebar", this.hideSidebar, this);
        },

        postRender: function() {
            chorus.menu(this.$('.found_in .open_other_menu'), {
                content: this.$('.found_in .other_menu'),
                classes: "found_in_other_workspaces_menu"
            });
        },

        drawColumns: function() {
            var serverErrors = this.columnSet.serverErrors
            this.columnSet = new chorus.collections.DatabaseColumnSet(this.columnSet.models);
            this.columnSet.serverErrors = serverErrors;
            this.columnSet.loaded = true;

            var customHeaderView = new headerView({
                model: this.tabularData,
                title: this.title(),
                imageUrl: this.tabularData.iconUrl(),
                imageTitle: Handlebars.helpers.humanizedTabularDataType(this.tabularData.attributes)
            });

            this.mainContent = new chorus.views.MainContentList({
                modelClass: "DatabaseColumn",
                collection: this.columnSet,
                persistent: true,
                contentHeader: customHeaderView,
                contentDetails: new chorus.views.TabularDataContentDetails(_.extend(
                    { tabularData: this.tabularData, collection: this.columnSet, hideDeriveChorusView: this.hideDeriveChorusView},
                    this.contentDetailsOptions))
            });

            this.mainContent.contentDetails.options.$columnList = $(this.mainContent.content.el);
            this.sidebar = new chorus.views.TabularDataSidebar(this.sidebarOptions);
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
                    this.secondarySidebar = new chorus.views.TabularDataVisualizationBoxplotSidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'frequency':
                    this.secondarySidebar = new chorus.views.TabularDataVisualizationFrequencySidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'histogram':
                    this.secondarySidebar = new chorus.views.TabularDataVisualizationHistogramSidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'heatmap':
                    this.secondarySidebar = new chorus.views.TabularDataVisualizationHeatmapSidebar({model: this.model, collection: this.columnSet});
                    break;
                case 'timeseries':
                    this.secondarySidebar = new chorus.views.TabularDataVisualizationTimeSeriesSidebar({model: this.model, collection: this.columnSet});
                    break;
            }
        },

        hideSidebar: function(type) {
            this.sidebar.disabled = false;
            if (this.secondarySidebar) {
                this.secondarySidebar.cleanup();
                delete this.secondarySidebar;
            }
            this.mainContent.content.render();
            this.$('.sidebar_content.primary').removeClass("hidden")
            this.$('.sidebar_content.secondary').addClass("hidden")
            this.removeOldSecondaryClasses(type);
            this.trigger('resized');
        },

        removeOldSecondaryClasses: function(type) {
            this.$('.sidebar_content.secondary').removeClass("tabular_data_visualization_" + type + "_sidebar");
        }
    });
})();
