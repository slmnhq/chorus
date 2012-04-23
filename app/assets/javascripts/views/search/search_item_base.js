chorus.views.SearchItemBase = chorus.views.Base.extend({
    tagName: "li",
    additionalClass: "result_item",

    events: {
        "click a.show_more_comments": "showMoreComments",
        "click a.show_fewer_comments": "showFewerComments",
        "click": "itemSelected"
    },

    postRender: function() {
        var commentsView = this.makeCommentList();
        this.$(".comments_container").append(commentsView.render().el);
    },

    makeCommentList: function() {
        return new chorus.views.SearchResultCommentList({comments: this.model.get("comments")});
    },

    showMoreComments: function(evt) {
        evt && evt.preventDefault();
        this.$(".has_more_comments").addClass("hidden");
        this.$(".more_comments").removeClass("hidden");
    },

    showFewerComments: function(evt) {
        evt && evt.preventDefault();
        this.$(".has_more_comments").removeClass("hidden");
        this.$(".more_comments").addClass("hidden");
    },

    itemSelected: function(evt) {
        this.options.search.selectedItem = this.model;
        chorus.PageEvents.broadcast(this.eventType + ":selected", this.model);
    }
})
