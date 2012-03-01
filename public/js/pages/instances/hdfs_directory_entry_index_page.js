chorus.pages.HdfsDirectoryEntryIndexPage = chorus.pages.Base.extend({
    setup:function (instanceId, path) {
        this.path = "/" + path;
        this.instance = new chorus.models.Instance({id: instanceId});
        this.instance.fetch();
        this.requiredResources.push(this.instance);

        this.collection = new chorus.collections.HdfsDirectoryEntrySet([], {instanceId: instanceId, path: this.path});
        this.collection.fetch();
        this.requiredResources.push(this.collection);
    },

    resourcesLoaded: function() {
        this.crumbs = [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances"), url: "#/instances" },
            { label: this.instance.get("name") }
        ];
        this.mainContent = new chorus.views.MainContentList({

            modelClass: "HdfsDirectoryEntry",
            collection: this.collection,
            title: this.instance.get("name") + ": " + this.path
        });

        this.sidebar = new chorus.views.HdfsDirectoryEntrySidebar();
    }
});