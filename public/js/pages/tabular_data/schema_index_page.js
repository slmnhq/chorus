chorus.pages.SchemaIndexPage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page
).extend({
    constructorName: "SchemaIndexPage",
    helpId: "instances",

    setup: function(instanceId, databaseName) {
        this.databaseName = databaseName;
        this.instance = new chorus.models.Instance({id: instanceId});
        this.collection = new chorus.collections.SchemaSet([], {instanceId: instanceId, databaseName: databaseName});

        this.instance.fetch();
        this.collection.fetchAll();

        this.dependOn(this.instance);
        this.dependOn(this.collection);

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Schema",
            collection: this.collection,
            title: this.databaseName,
            imageUrl: "/images/instances/greenplum_database.png"
        });

        this.sidebar = new chorus.views.SchemaListSidebar();
    },

    crumbs: function() {
        return [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name"), url: this.instance.showUrl() },
            { label: this.databaseName }
        ];
    }
});
