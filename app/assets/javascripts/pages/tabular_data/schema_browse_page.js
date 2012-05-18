chorus.pages.SchemaBrowsePage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page
).extend({
    helpId: "schema",

    setup: function(schema_id) {
        this.schema = new chorus.models.Schema({ id: schema_id });
        this.collection = this.schema.databaseObjects();

        this.dependOn(this.schema, this.schemaLoaded);
        this.dependOn(this.collection);

        this.schema.fetch();
        this.collection.sortAsc("objectName");
        this.collection.fetch();

        this.sidebar = new chorus.views.TabularDataSidebar({listMode: true});

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "TabularData",
            collection: this.collection
        });

        chorus.PageEvents.subscribe("tabularData:selected", function(dataset) {
            this.model = dataset;
        }, this);

        this.bindings.add(this.collection, 'searched', function() {
            this.mainContent.content.render();
            this.mainContent.contentFooter.render();
            this.mainContent.contentDetails.updatePagination();
        })
    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.instances"), url: '#/instances'},
            {label: this.schema.database().instance().name(), url: this.schema.database().instance().showUrl()},
            {label: this.schema.database().name(), url: this.schema.database().showUrl() },
            {label: this.schema.name()}
        ];
    },

    schemaLoaded: function() {
        var onTextChangeFunction = _.debounce(_.bind(function(e) {
            this.collection.search($(e.target).val());
            this.mainContent.contentDetails.startLoading(".count");
        }, this), 300);

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "TabularData",
            collection: this.collection,
            title: this.schema.canonicalName(),
            search: {
                placeholder: t("schema.search"),
                onTextChange: onTextChangeFunction
            },
            contentOptions: { checkable: true },
            contentDetailsOptions: { multiSelect: true }
        });

        this.render();
    }
});
