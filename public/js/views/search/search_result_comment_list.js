chorus.views.SearchResultCommentList = chorus.views.Base.extend({
    constructorName: "SearchResultCommentList",
    className: "search_result_comment_list",

    events: {
        "click a.show_more_comments": "showMoreComments",
        "click a.show_fewer_comments": "showLessComments"
    },

    setup: function() {
        this.collection = this.options.comments;
    },

    showMoreComments: function(e) {
        e && e.preventDefault();
        var $li = $(e.target).closest("li");
        this.$(".has_more_comments").addClass("hidden");
        this.$(".more_comments").removeClass("hidden");
    },

    showLessComments: function(e) {
        e && e.preventDefault();
        var $li = $(e.target).closest("li");
        this.$(".has_more_comments").removeClass("hidden");
        this.$(".more_comments").addClass("hidden");
    },

    additionalContext: function() {
        return {
            comments: this.collection.slice(0, 3),
            moreComments: this.collection.slice(3),
            hasMoreComments: Math.max(0, this.collection.length - 3)
        }
    }
});