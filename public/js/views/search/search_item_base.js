chorus.views.SearchItemBase = chorus.views.Base.extend({
    tagName: "li",
    additionalClass: "result_item",

    makeCommentList: function() {
        return new chorus.views.SearchResultCommentList({comments: this.model.get("comments")});
    },

    postRender: function() {
        $(this.el).data('cid', this.model.cid);
        var commentsView = this.makeCommentList();
        this.$(".comments_container").append(commentsView.render().el);
    }
})