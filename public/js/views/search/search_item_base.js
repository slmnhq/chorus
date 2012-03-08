chorus.views.SearchItemBase = chorus.views.Base.extend({
    makeCommentList: function() {
        return new chorus.views.SearchResultCommentList({comments: this.model.get("comments")});
    },

    postRender: function() {
        var commentsView = this.makeCommentList();
        this.$(".comments_container").append(commentsView.render().el);
    }
})