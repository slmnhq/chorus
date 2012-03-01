chorus.pages.HdfsDirectoryEntryIndexPage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.home"), url:"#/" },
        { label:t("breadcrumbs.instances"), url: "#/instances" },
    ],

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
        this.crumbs.push({ label : this.instance.get("name")});
        this.mainContent = new chorus.views.MainContentList({
            modelClass: "HdfsDirectoryEntry",
            collection: this.collection,
            title: this.instance.get("name") + ": " + this.path
        });

        this.sidebar = new chorus.views.HdfsDirectoryEntrySidebar();
    }
});