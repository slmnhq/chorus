chorus.views.SearchResultHeader = chorus.views.Base.extend({
    constructorName: "SearchResultHeader",
    className: "search_result_header",

    events: {
        "click a.show_all": "showAll",
        "click a.next": "showNext",
        "click a.previous": "showPrevious"
    },

    setup: function() {
        this.query = this.options.query;
        this.collection = this.options.collection;
    },

    additionalContext: function() {
        var ctx = {
            hasNext: this.query && this.query.hasNextPage(),
            hasPrevious: this.query && this.query.hasPreviousPage(),
            filteredSearch: this.query && this.query.hasSpecificEntityType(),
            entityType: this.options.entityType,
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
            moreResults: (this.collection.models.length < this.collection.attributes.total),
            title: t("search.type." + this.options.entityType)
        };

        if(ctx.hasNext || ctx.hasPrevious) {
            ctx.currentPage = this.query.currentPageNumber();
            ctx.totalPages = this.query.totalPageNumber();
        }

        return ctx;
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
    }
});