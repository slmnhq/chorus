chorus.views.DatasetList = chorus.views.Base.extend({
    tagName:"ul",
    className:"dataset_list",
    additionalClass:"list",
    events:{
        "click li":"selectDataset"
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

        lis.eq(this.selectedIndex || 0).click();
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

    selectDataset:function (e) {
        this.$("li").removeClass("selected");
        var selectedLi = $(e.target).closest("li");
        selectedLi.addClass("selected");
        if (this.selectedDataset) {
            this.bindings.remove(this.selectedDataset, "invalidated", this.refetchCollection)
        }

        this.selectedDataset = selectedLi.data("dataset");
        this.bindings.add(this.selectedDataset, "invalidated", this.refetchCollection, this);
        this.trigger("dataset:selected", this.selectedDataset);
    }
});