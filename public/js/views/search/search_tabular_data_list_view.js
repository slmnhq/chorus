chorus.views.SearchTabularDataList = chorus.views.Base.extend({
    className: "search_tabular_data_list",
    additionalClass: "list",

    events: {
        "click a.more_comments": "onMoreCommentsClicked",
        "click a.fewer_comments": "onLessCommentsClicked"
    },

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
            moreResults: (this.collection.length < this.collection.attributes.total)
        }
    },

    collectionModelContext: function(model) {
        var comments = model.get("comments") || [];

        return {
            showUrl: model.showUrl(),
            iconUrl: model.iconUrl(),
            comments: comments.slice(0, 3),
            moreCommentCount: Math.max(0, comments.length - 3),
            moreComments: comments.slice(3)
        }
    },

    postRender: function() {
        var lis = this.$("li");

        _.each(this.collection.models, function(model, index) {
            var $li = lis.eq(index);
            $li.find("a.instance, a.database").data("instance", model.get("instance"));
        });
    },

    onLessCommentsClicked: function(e) {
        e.preventDefault();
        this.$("div.more_comments").addClass("hidden");
        this.$("a.more_comments").removeClass("hidden");
    },

    onMoreCommentsClicked: function(e) {
        e.preventDefault();
        this.$("a.more_comments").addClass("hidden");
        this.$("div.more_comments").removeClass("hidden");
    }
});
