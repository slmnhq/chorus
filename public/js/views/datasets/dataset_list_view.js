chorus.views.DatasetList = chorus.views.Base.extend({
    tagName:"ul",
    className:"dataset_list",
    additionalClass:"list",
    events:{
        "click li":"selectDataset"
    },

    postRender:function () {
        var lis = this.$("li");

        _.each(this.collection.models, function (model, index) {
            lis.eq(index).data("dataset", model);
        });

        lis.eq(0).click();
    },

    collectionModelContext:function (model) {
        var ctx = {
            iconImgUrl:model.iconUrl(),
            showUrl:model.showUrl()
        }

        var recentComment = model.lastComment();
        if (recentComment) {
            var date = Date.parseFromApi(recentComment.get("commentCreatedStamp"))

            ctx.lastComment = {
                body:recentComment.get("body"),
                creator:recentComment.author(),
                on:date && date.toString("MMM d")
            }

            ctx.otherCommentCount = parseInt(model.get("commentCount")) - 1;
        }

        return ctx;
    },

    selectDataset:function (e) {
        this.$("li").removeClass("selected");
        var selectedDataset = $(e.target).closest("li");
        selectedDataset.addClass("selected");
        this.trigger("dataset:selected", selectedDataset.data("dataset"));
    }
});