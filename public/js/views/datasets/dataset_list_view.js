chorus.views.DatasetList = chorus.views.Base.extend({
    tagName:"ul",
    className:"dataset_list",
    additionalClass:"list",
    events:{
        "click li":"selectDatasetByClick"
    },

    preRender : function() {
        var selectedLi = this.$("li.selected");
        if (selectedLi.length > 0) {
            this.selectedIndex = selectedLi.index(selectedLi.parentNode)
        }
    },

    postRender:function () {
        var lis = this.$("li");

        _.each(this.collection.models, function (model, index) {
            lis.eq(index).data("dataset", model);
        });

        this.selectDataset(lis.eq(this.selectedIndex || 0));
    },

    refetchCollection : function() {
        this.collection.fetch();
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

    selectDataset:function ($li) {
        this.$("li").removeClass("selected");
        $li.addClass("selected");

        this.selectedDataset = $li.data("dataset");
        this.trigger("dataset:selected", this.selectedDataset);
    },

    selectDatasetByClick : function(e) {
        e.preventDefault();
        this.selectDataset($(e.target).closest("li"));
    }
});
