chorus.pages.SchemaBrowsePage = chorus.pages.Base.extend(_.extend({}, chorus.Mixins.InstanceCredentials.page, {
    helpId: "schema",
    useLoadingSection: true,

    setup: function(instanceId, databaseName, schemaName) {
        this.schema = new chorus.models.Schema({
            instanceId: instanceId,
            databaseName: databaseName,
            name: schemaName
        });

        this.instance = new chorus.models.Instance({id: instanceId});
        this.instance.fetch();
        this.requiredResources.push(this.instance);

        this.collection = new chorus.collections.DatabaseObjectSet([], {instanceId: instanceId, databaseName: databaseName, schemaName: schemaName });
        this.collection.sortAsc("objectName");
        this.collection.fetch();
        this.requiredResources.push(this.collection);

        this.sidebar = new chorus.views.TabularDataSidebar({listMode: true});

        chorus.PageEvents.subscribe("tabularData:selected", function(dataset) {
            this.model = dataset;
        }, this);
    },

    resourcesLoaded: function() {
        this.schema.set({instanceName: this.instance.get("name")});

        var database = new chorus.models.Database({instanceId: this.instance.id, name: this.schema.get("databaseName")});
        this.crumbs = [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.instances"), url: '#/instances'},
            {label: this.instance.get("name"), url: this.instance.showUrl()},
            {label: this.schema.get("databaseName"), url: database.showUrl() },
            {label: this.schema.get("name")}
        ];

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Dataset",
            collection: this.collection,
            title: this.schema.canonicalName()
        });

        this.render();
    }
}));
