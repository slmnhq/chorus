chorus.pages.SchemaIndexPage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page
).extend({
    constructorName: "SchemaIndexPage",
    helpId: "instances",

    setup: function(instance_id, databaseName) {
        this.databaseName = databaseName;
        this.instance = new chorus.models.Instance({id: instance_id});
        this.collection = new chorus.collections.SchemaSet([], {instance_id: instance_id, databaseName: this.databaseName});

        this.instance.fetch();
        this.collection.fetchAll();

        this.dependOn(this.instance);
        this.dependOn(this.collection);

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Schema",
            collection: this.collection,
            title: this.databaseName,
            imageUrl: "/images/instances/greenplum_database.png",
            search: {
                selector: ".name",
                placeholder: t("schema.search_placeholder"),
                eventName: "schema:search"
            }
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
