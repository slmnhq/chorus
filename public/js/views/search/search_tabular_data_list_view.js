chorus.views.SearchTabularDataList = chorus.views.SearchResultListBase.extend({
    searchResultType: "dataset",
    className: "search_tabular_data_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
            moreResults: (this.collection.length < this.collection.attributes.total)
        }
    },

    collectionModelContext: function(model) {
        var comments = model.get("comments") || [];

        var context = {
            dataset: model.asDataset(),
            showUrl: model.showUrl(),
            iconUrl: model.iconUrl(),
            comments: comments.slice(0, 3),
            moreCommentCount: Math.max(0, comments.length - 3),
            moreComments: comments.slice(3)
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
        var lis = this.$("li");

        _.each(this.collection.models, function(model, index) {
            var $li = lis.eq(index);
            $li.find("a.instance, a.database").data("instance", model.get("instance"));

            chorus.menu($li.find(".location .found_in a.open_other_menu"), {
                content: $li.find(".other_menu")
            });
        });
    },
});
