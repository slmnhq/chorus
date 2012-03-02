chorus.views.SearchWorkspaceList = chorus.views.Base.extend({
    className: "search_workspace_list",
    additionalClass: "list",

    events: {
        "click li .comments .hasMore a.hasMoreLink": "showMoreComments",
        "click li a.lessComments": "showLessComments"
    },

    showMoreComments: function(evt) {
        evt && evt.preventDefault();
        $(evt.target).closest("li").find(".moreComments").removeClass("hidden");
        $(evt.target).addClass("hidden");
    },

    showLessComments: function(evt) {
        evt && evt.preventDefault();
        $(evt.target).closest("li").find(".moreComments").addClass("hidden");
        $(evt.target).closest("li").find("a.hasMoreLink").removeClass("hidden");
    },

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
        return {
            showUrl: model.showUrl(),
            iconUrl: model.customIconUrl(),
            description: model.get("description"),
            comments: comments.slice(0, 3),
            moreComments: comments.slice(3),
            hasMoreComments: Math.max(0, comments.length - 3)
        }
    }
});