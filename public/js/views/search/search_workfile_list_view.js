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

    makeCommentList: function(model) {
        var comments = model.get("comments") || [];
        var commitMessages = model.get("highlightedAttributes") && model.get("highlightedAttributes").commitMessage;
        _.each(commitMessages || [], function(commitMessage) {
            comments.push({isCommitMessage:true, content: commitMessage});
        }, this);

        return new chorus.views.SearchResultCommentList({comments: comments});
    }
});
