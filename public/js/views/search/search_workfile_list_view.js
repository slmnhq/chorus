chorus.views.SearchWorkfileList = chorus.views.SearchResultListBase.extend({
    className: "search_workfile_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model){
        var comments = model.get("comments") ? model.get("comments").map(function(comment) {
                        return comment.attributes || comment;
                    }) : [];

        _.each(model.get("commitMessage"), function(commitMessage) {
            comments.push({isCommitMessage:true, content: commitMessage});
        }, this);

        return {
            showUrl: model.showUrl(),
            iconUrl: model.iconUrl(),
            comments: comments.slice(0, 3),
            moreComments: comments.slice(3),
            hasMoreComments: Math.max(0, comments.length - 3),
            workspaces: [model.workspace().attributes]
        }
    }
});
