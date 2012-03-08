chorus.views.SearchWorkfileList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchWorkfileListView",
    className: "search_workfile_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl(),
            iconUrl: model.iconUrl(),
            workspaces: [model.workspace().attributes]
        }
    },

    postRender: function() {
        var models = this.collection.models;
        for (var i = 0; i < models.length; i++ ) {
            var model = models[i];

            var comments = model.get("comments") || [];
            _.each(model.get("commitMessage"), function(commitMessage) {
                comments.push({isCommitMessage:true, content: commitMessage});
            }, this);

            if (comments.length > 0) {
                var view = new chorus.views.SearchResultCommentList({comments: comments});
                view.render();

                this.$("li").eq(i).find(".comments_container").append(view.el);
            }
        }
    }
});
