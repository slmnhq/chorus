chorus.views.WorkfileList = chorus.views.SelectableList.extend({
    className:"workfile_list",

    itemSelected: function(model) {
        if(model) {
            chorus.PageEvents.broadcast("workfile:selected", model);
        }
    },

    collectionModelContext:function (model) {
        var ctx = new chorus.presenters.Artifact(model, {iconSize:'large'});

        var lastComment = model.lastComment();
        if (lastComment) {
            var date = Date.parseFromApi(lastComment.get("commentCreatedStamp"))

            ctx.lastComment = {
                body:lastComment.get("body"),
                creator:lastComment.author(),
                on:date && date.toString("MMM d")
            }

            ctx.otherCommentCount = parseInt(model.get("commentCount"), 10) - 1;
        }

        return ctx;
    },

    filter:function (type) {
        this.collection.attributes.type = type;
        this.collection.fetch();
        return this;
    },

    postRender:function () {
        var li;

        if (chorus.page && chorus.page.pageOptions && chorus.page.pageOptions.workfileId) {
            if (this.collection.loaded) {
                var match = this.$("li[data-id=" + chorus.page.pageOptions.workfileId + "]");
                if (match.length) {
                    li = match;
                    this.selectItem(li);
                }

                delete chorus.page.pageOptions;
            }
        }

        this._super('postRender', arguments);
    }
});