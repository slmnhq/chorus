chorus.pages.TabularDataShowPage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page).extend({
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
                {label: this.tabularData.instance().name(), url: this.tabularData.instance().databases().showUrl() },
                {label: this.tabularData.database().name(), url: this.tabularData.database().showUrl() },
                {label: this.tabularData.schema().name(), url: this.tabularData.schema().showUrl()},
                {label: this.tabularData.name()}
            ];
        },

        makeModel: function(instanceId, databaseName, schemaName, objectType, objectName) {
            this.model = this.tabularData = new chorus.models.DatabaseObject({
                objectName: objectName,
                objectType: objectType,
                schema: {
                    name: schemaName,
                    database: {
                        name: databaseName,
                        instance: { id: instanceId }
                    }
                }
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

            var customHeaderView = this.getHeaderView({
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

            this.render();
        },

        getHeaderView: function(options) {
            return new chorus.views.TabularDataShowContentHeader(options);

        }
    }
);
