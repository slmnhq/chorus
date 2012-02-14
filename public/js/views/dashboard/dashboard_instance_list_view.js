chorus.views.DashboardInstanceList = chorus.views.Base.extend({
    className:"dashboard_instance_list",
    tagName:"ul",
    additionalClass:"list",
    useLoadingSection:true,

    collectionModelContext: function(model) {
        return { 
            imageUrl: model.providerIconUrl()
        }
    },

    postRender: function() {
        var self = this;
        this.$("li").each(function(i, li) {
            var id = $(li).data("id");
            var instance = self.collection.get(id);
            $(li).find("a[data-dialog='BrowseDatasets']").data("instance", {
                id: instance.get("id"),
                name: instance.get("name")
            });
        })
    }
});

