chorus.views.DashboardInstanceList = chorus.views.Base.extend({
    constructorName: "DashboardInstanceListView",
    templateName:"dashboard/instance_list",
    tagName:"ul",
    additionalClass:"list",
    useLoadingSection:true,

    collectionModelContext: function(model) {
        return {
            id: model.get("theInstance").get("id"),
            name: model.get("theInstance").get("name"),
            imageUrl: model.get("theInstance").providerIconUrl(),
            isHadoop: model.get("theInstance").isHadoop(),
            showUrl: model.get("theInstance").showUrl()
        }
    }
});

