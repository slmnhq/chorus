chorus.views.SearchTabularDataList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchTabularDataListView",
    className: "search_tabular_data_list",
    additionalClass: "list",
    entityType: "dataset",

    collectionModelContext: function(model) {
        var context = {
            dataset: model.asDataset(),
            showUrl: model.showUrl(),
            iconUrl: model.iconUrl()
        };

        var workspaces;
        if (model.get("workspaces")) {
            context.workspaces = model.get("workspaces");
        } else if (model.get("workspace")) {
            context.workspaces = [model.get("workspace")];
        }

        return context;
    },

    postRender: function() {
        this._super("postRender");

        var lis = this.$("li");
        _.each(this.collection.models, function(model, i) {
            var $li = lis.eq(i);
            $li.find("a.instance, a.database").data("instance", model.get("instance"));
            chorus.menu($li.find(".location .found_in a.open_other_menu"), {
                content: $li.find(".other_menu")
            });
        });
    }
});
