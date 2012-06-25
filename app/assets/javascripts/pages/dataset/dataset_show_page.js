chorus.pages.DatasetShowPage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page).extend({
        constructorName: "DatasetShowPage",
        helpId: "dataset",
        hideDeriveChorusView: true,
        additionalClass: 'dataset_show',
        sidebarOptions: {},
        contentDetailsOptions: {},

        failurePageOptions: function() {
            return {
                title: t("invalid_route.dataset.title"),
                text: t("invalid_route.dataset.content")
            };
        },

        title: function() {
            return this.dataset.get('objectName')
        },

        setup: function() {
            this.makeModel.apply(this, arguments)
            this.dependOn(this.dataset);
            this.fetchResources();
            this.mainContent = new chorus.views.LoadingSection();
        },

        crumbs: function() {
            return [
                {label: t("breadcrumbs.home"), url: "#/"},
                {label: t("breadcrumbs.instances"), url: '#/instances'},
                {label: this.dataset.instance().name(), url: this.dataset.instance().databases().showUrl() },
                {label: this.dataset.database().name(), url: this.dataset.database().showUrl() },
                {label: this.dataset.schema().name(), url: this.dataset.schema().showUrl()},
                {label: this.dataset.name()}
            ];
        },

        makeModel: function(datasetId) {
            this.model = this.dataset = new chorus.models.Dataset({

                id: datasetId
            });
        },

        fetchResources: function() {
            this.dataset.fetch();
            this.bindings.add(this.dataset, "change", this.fetchColumnSet);
        },

        fetchColumnSet: function() {
            this.columnSet = this.dataset.columns();
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
                model: this.dataset,
                title: this.title(),
                imageUrl: this.dataset.iconUrl(),
                imageTitle: Handlebars.helpers.humanizedDatasetType(this.dataset.attributes)
            });

            this.mainContent = new chorus.views.MainContentList({
                modelClass: "DatabaseColumn",
                collection: this.columnSet,
                persistent: true,
                contentHeader: customHeaderView,
                contentDetails: new chorus.views.DatasetContentDetails(_.extend(
                    { dataset: this.dataset, collection: this.columnSet, hideDeriveChorusView: this.hideDeriveChorusView},
                    this.contentDetailsOptions))
            });

            this.mainContent.contentDetails.options.$columnList = $(this.mainContent.content.el);
            this.sidebar = new chorus.views.DatasetSidebar(this.sidebarOptions);
            this.sidebar.setDataset(this.dataset);

            this.mainContent.contentDetails.bind("transform:sidebar", this.showSidebar, this);

            this.render();
        },

        getHeaderView: function(options) {
            return new chorus.views.DatasetShowContentHeader(options);

        }
    }
);
