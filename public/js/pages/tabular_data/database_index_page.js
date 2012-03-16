chorus.pages.DatabaseIndexPage = chorus.pages.Base.extend(_.extend({}, chorus.Mixins.InstanceCredentials.page, {
    constructorName: "DatabaseIndexPage",

    setup: function(instanceId) {
        this.instance = new chorus.models.Instance({id: instanceId});
        this.collection = this.instance.databases();

        this.instance.fetch();
        this.collection.fetchAll();

        this.requiredResources.push(this.instance);
        this.requiredResources.push(this.collection);
    },


    resourcesLoaded: function() {
        this.crumbs = [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name") }
        ];

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Database",
            collection: this.collection,
            title: this.instance.get("name"),
            imageUrl: this.instance.providerIconUrl()
        });

        this.sidebar = new chorus.views.DatabaseListSidebar();
    }
}));
