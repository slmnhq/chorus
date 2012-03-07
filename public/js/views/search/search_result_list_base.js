chorus.views.SearchResultListBase = chorus.views.Base.extend({
    constructorName: "SearchResultListBase",
    events: {
        "click li a.show_more_comments": "showMoreComments",
        "click li a.show_fewer_comments": "showLessComments",
        "click a.show_all": "showAll"
    },

    setup: function() {
        this.query = this.options.query;
    },

    showMoreComments: function(evt) {
        evt && evt.preventDefault();
        var $li = $(evt.target).closest("li");
        $li.find(".hasMore").addClass("hidden");
        $li.find(".moreComments").removeClass("hidden");
    },

    showLessComments: function(evt) {
        evt && evt.preventDefault();
        var $li = $(evt.target).closest("li");
        $li.find(".hasMore").removeClass("hidden");
        $li.find(".moreComments").addClass("hidden");
    },

    showAll: function(e) {
        e && e.preventDefault();
        this.query.set({entityType: $(e.currentTarget).data("type")})
        chorus.router.navigate(this.query.showUrl(), true);
    }
});