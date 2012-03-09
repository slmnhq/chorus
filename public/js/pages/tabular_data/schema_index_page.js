chorus.pages.SchemaIndexPage = chorus.pages.Base.extend({
    constructorName: "SchemaIndexPage",

    setup: function(instanceId, databaseName) {
        this.databaseName = databaseName;
        this.instance = new chorus.models.Instance({id: instanceId});
        this.collection = new chorus.collections.SchemaSet([], {instanceId: instanceId, databaseName: databaseName});

        this.instance.fetch();
        this.collection.fetchAll();

        this.requiredResources.push(this.instance);
        this.requiredResources.push(this.collection);
    },

    resourcesLoaded: function() {
        this.crumbs = [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name"), url: this.instance.showUrl() },
            { label: this.databaseName }
        ];

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Schema",
            collection: this.collection,
            title: this.databaseName,
            imageUrl: "/images/instances/greenplum_database.png"
        });

        this.sidebar = new chorus.views.SchemaListSidebar();
    }
});