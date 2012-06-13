chorus.pages.SchemaBrowsePage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page
).extend({
    helpId: "schema",

    setup: function(instanceId, databaseName, schemaName) {
        this.schema = new chorus.models.Schema({
            instanceId: instanceId,
            databaseName: databaseName,
            name: schemaName
        });

        this.instance = new chorus.models.Instance({id: instanceId});
        this.instance.fetch();
        this.dependOn(this.instance, this.instanceLoaded);

        this.collection = new chorus.collections.DatabaseObjectSet([], {instanceId: instanceId, databaseName: databaseName, schemaName: schemaName });
        this.collection.sortAsc("objectName");
        this.collection.fetch();
        this.dependOn(this.collection);

        this.sidebar = new chorus.views.TabularDataSidebar({listMode: true});

        this.mainContent = new chorus.views.MainContentList({
            emptyTitleBeforeFetch: true,
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
        var database = new chorus.models.Database({instanceId: this.instance.id, name: this.schema.get("databaseName")});
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.instances"), url: '#/instances'},
            {label: this.instance.get("name"), url: this.instance.showUrl()},
            {label: this.schema.get("databaseName"), url: database.showUrl() },
            {label: this.schema.get("name")}
        ];
    },

    instanceLoaded: function() {
        this.schema.set({instanceName: this.instance.get("name")});

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
