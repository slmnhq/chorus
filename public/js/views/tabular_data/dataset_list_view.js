chorus.views.DatasetList = chorus.views.SelectableList.extend({
    className: "dataset_list",
    useLoadingSection: true,

    postRender: function() {
        this._super("postRender", arguments);
        var lis = this.$("li.dataset");

        _.each(this.collection.models, function(model, index) {
            lis.eq(index).find("a.instance, a.database").data("instance", model.get("instance"));
        });

        this.$('.found_in .open_other_menu').each(function() {
            var $el = $(this);
            chorus.menu($el, {
                content: $el.parent().find('.other_menu')
            });
        })
    },

    refetchCollection: function() {
        this.collection.fetch();
    },

    collectionModelContext: function(model) {
        var ctx = {
            dataset: model.asDataset(),
            iconImgUrl: model.iconUrl(),
            showUrl: model.showUrl(),
            schemaShowUrl: model.schema().showUrl(),
            importFrequency: chorus.helpers.importFrequencyForModel(model),
            noCredentials: model.get('hasCredentials') === false,
            workspaces: model.get("workspaceUsed") && model.get("workspaceUsed").workspaceList
        };

        var recentComment = model.lastComment();
        if (recentComment) {
            var date = Date.parseFromApi(recentComment.get("commentCreatedStamp"))

            ctx.lastComment = {
                body: recentComment.get("body"),
                creator: recentComment.author(),
                on: date && date.toString("MMM d")
            }

            ctx.otherCommentCount = parseInt(model.get("commentCount"), 10) - 1;
        }

        return ctx;
    },

    itemSelected: function(model) {
        chorus.PageEvents.broadcast("tabularData:selected", model);
    }
});
