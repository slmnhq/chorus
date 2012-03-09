chorus.views.SearchResultListBase = chorus.views.Base.extend({
    constructorName: "SearchResultListBase",
    additionalClass: "list",

    events: {
        "click a.show_all": "showAll",
        "click a.next": "showNext",
        "click a.previous": "showPrevious"
    },

    setup: function() {
        this.query = this.options.query;
        this.entityType = this.options.entityType;
        this.className = "search_" + this.entityType + "_list";
        this.listItemConstructorName = "Search" + _.capitalize(this.entityType);
    },

    additionalContext: function() {
        var ctx = {
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
            hasNext: this.query && this.query.hasNextPage(),
            hasPrevious: this.query && this.query.hasPreviousPage(),
            filteredSearch: this.query && this.query.entityType() == this.entityType,
            moreResults: (this.collection.models.length < this.collection.attributes.total)
        };

        if(ctx.hasNext || ctx.hasPrevious) {
            ctx.currentPage = this.query.currentPageNumber();
            ctx.totalPages = this.query.totalPageNumber();
        }

        return ctx;
    },

    postRender: function() {
        var ul = this.$("ul");
        this.collection.each(function(model) {
            ul.append(this.makeListItemView(model).render().el);
        }, this);
    },

    makeListItemView: function(model) {
        return new chorus.views[this.listItemConstructorName]({ model: model });
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
