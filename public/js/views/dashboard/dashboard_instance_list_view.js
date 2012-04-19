chorus.views.DashboardInstanceList = chorus.views.Base.extend({
    constructorName: "DashboardInstanceListView",
    templateName:"dashboard/instance_list",
    tagName:"ul",
    additionalClass:"list",
    useLoadingSection:true,

    collectionModelContext: function(model) {
        return {
            imageUrl: model.providerIconUrl(),
            isHadoop: model.isHadoop(),
            showUrl: model.showUrl()
        }
    }
});

