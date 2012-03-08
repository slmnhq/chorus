chorus.views.SearchWorkspaceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchWorkspaceListView",
    className: "search_workspace_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model){
        return {
            showUrl: model.showUrl(),
            iconUrl: model.customIconUrl()
        }
    },

    postRender: function() {
        var lis = this.$("li");
        var models = this.collection.models;
        for (var i = 0; i < models.length; i++ ) {
            var comments = models[i].get("comments");

            if (comments && comments.length > 0) {
                var view = new chorus.views.SearchResultCommentList({comments: comments});
                view.render();

                lis.eq(i).find(".comments_container").append(view.el);
            }
        }
    }
});