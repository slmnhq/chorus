chorus.views.SearchWorkfile = chorus.views.SearchItemBase.extend({
    constructorName: "SearchWorkfileView",
    templateName: "search_workfile",
    eventType: "workfile",

    additionalContext: function () {
        return {
            showUrl: this.model.showUrl(),
            iconUrl: this.model.iconUrl(),
            workspaces: [this.model.workspace().attributes]
        }
    },

    makeCommentList: function (){
        var comments = this.model.get("comments") || [];
        var commitMessages = this.model.get("highlightedAttributes") && this.model.get("highlightedAttributes").commitMessage;
        _.each(commitMessages || [], function(commitMessage) {
            comments.push({isCommitMessage:true, content: new Handlebars.SafeString(commitMessage)});
        }, this);

        return new chorus.views.SearchResultCommentList({comments: comments});
    }
});
