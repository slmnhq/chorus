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
            var $li = lis.eq(index);
            $li.data("dataset", model);
            $li.find("a.instance, a.database").data("instance", model.get("instance"));
        });

        this.selectDataset(lis.eq(this.selectedIndex || 0));
    },

    refetchCollection : function() {
        this.collection.fetch();
    },

    additionalContext:function(){
        return {browsingSchema: this.options.browsingSchema};
    },

    collectionModelContext:function (model) {
        var workspaceUsed = model.get("workspaceUsed");
        var workspace = workspaceUsed && workspaceUsed.workspaceList[0]
        var otherWorkspaceCount = ((workspaceUsed && workspaceUsed.workspaceCount) || 1) - 1;
        var ctx = {
            iconImgUrl:model.iconUrl(),
            showUrl:model.showUrl(),
            schemaShowUrl: model.schema().showUrl(),
            otherWorkspaceCount : otherWorkspaceCount
        };

        if (workspace) {
            ctx.foundInWorkspaceLink = chorus.helpers.linkTo(new chorus.models.Workspace(workspace).showUrl(), workspace.name);
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
        chorus.PageEvents.broadcast("dataset:selected", this.selectedDataset);
    },

    selectDatasetByClick : function(e) {
        this.selectDataset($(e.target).closest("li"));
    }
});
