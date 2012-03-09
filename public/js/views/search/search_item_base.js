chorus.views.SearchItemBase = chorus.views.Base.extend({
    tagName: "li",
    additionalClass: "result_item",

    events: {
        "click a.show_more_comments": "showMoreComments",
        "click a.show_fewer_comments": "showLessComments"
    },

    postRender: function() {
        $(this.el).data('cid', this.model.cid);
        var commentsView = this.makeCommentList();
        this.$(".comments_container").append(commentsView.render().el);
    },

    makeCommentList: function() {
        return new chorus.views.SearchResultCommentList({comments: this.model.get("comments")});
    },

    showMoreComments: function(evt) {
        evt && evt.preventDefault();
        var $li = $(evt.target).closest("li");
        $li.find(".has_more_comments").addClass("hidden");
        $li.find(".more_comments").removeClass("hidden");
    },

    showLessComments: function(evt) {
        evt && evt.preventDefault();
        var $li = $(evt.target).closest("li");
        $li.find(".has_more_comments").removeClass("hidden");
        $li.find(".more_comments").addClass("hidden");
    }
})