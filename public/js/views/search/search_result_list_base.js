chorus.views.SearchResultListBase = chorus.views.Base.extend({
    constructorName: "SearchResultListBase",
    events: {
        "click li a.show_more_comments": "showMoreComments",
        "click li a.show_fewer_comments": "showLessComments",
        "click a.show_all": "showAll",
        "click a.next": "showNext",
        "click a.previous": "showPrevious"
    },

    setup: function() {
        this.query = this.options.query;
    },

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
            hasNext: this.query && this.query.hasNextPage(),
            hasPrevious: this.query && this.query.hasPreviousPage(),
            filteredSearch: this.query && this.query.entityType() == this.entityType,
            moreResults: (this.collection.models.length < this.collection.attributes.total)
        }
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
    },

    showAll: function(e) {
        e && e.preventDefault();
        this.query.set({entityType: $(e.currentTarget).data("type")})
        chorus.router.navigate(this.query.showUrl(), true);
    },
    
    showNext: function(e) {
        e && e.preventDefault();
        this.query.getNextPage();
        this.render();
    },

    showPrevious: function(e) {
        e && e.preventDefault();
        this.query.getPreviousPage();
        this.render();
    },

    makeCommentList: function(model) {
        return new chorus.views.SearchResultCommentList({comments: model.get("comments")});
    },

    postRender: function() {
        var models = this.collection.models;
        for (var i = 0; i < models.length; i++ ) {
            var model = models[i];
            var view = this.makeCommentList(model);
            view.render();

            this.$("li").eq(i).find(".comments_container").append(view.el);
        }
    }
});