chorus.pages.HdfsDirectoryEntryIndexPage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.home"), url:"#/" },
        { label:t("breadcrumbs.instances"), url: "#/instances" },
        { label: "Here" }
    ],

    setup:function (instanceId, path) {
        this.collection = new chorus.collections.HdfsDirectoryEntrySet([], {instanceId: instanceId, path: "/" + path});
        this.collection.fetch();

        this.mainContent = new chorus.views.MainContentList({
            modelClass:"HdfsDirectoryEntry",
            collection:this.collection
        });
    }
});