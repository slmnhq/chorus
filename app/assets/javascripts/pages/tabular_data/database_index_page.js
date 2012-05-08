chorus.pages.DatabaseIndexPage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page
).extend({
    constructorName: "DatabaseIndexPage",
    helpId: "instances",

    failurePageOptions: function() {
        return {
            title: t("invalid_route.database_index.title"),
            text: t("invalid_route.database_index.content")
        };
    },

    setup: function(instance_id) {
        this.instance = new chorus.models.Instance({id: instance_id});
        this.collection = this.instance.databases();

        this.instance.fetch();
        this.collection.fetchAll();

        this.dependOn(this.instance, this.instanceLoaded);
        this.dependOn(this.collection);

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Database",
            collection: this.collection
        });

        this.sidebar = new chorus.views.DatabaseListSidebar();
    },

    instanceLoaded: function() {
        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Database",
            collection: this.collection,
            title: this.instance.get("name"),
            imageUrl: this.instance.providerIconUrl(),
            search: {
                eventName: "database:search",
                placeholder: t("database.search_placeholder")
            }
        });

        this.render();
    },

    crumbs: function() {
        return [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name") }
        ];
    }
});
