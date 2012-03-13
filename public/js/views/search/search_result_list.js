chorus.views.SearchResultList = chorus.views.Base.extend({
    constructorName: "SearchResultList",
    additionalClass: "list",
    className: "search_result_list",

    events: {
        "click a.show_all": "showAll",
        "click a.next": "showNext",
        "click a.previous": "showPrevious"
    },

    setup: function() {
        this.search = this.options.search;
        this.entityType = this.options.entityType;
        this.listItemConstructorName = "Search" + _.capitalize(this.entityType);
    },

    additionalContext: function() {
        var ctx = {
            entityType: this.entityType,
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
            hasNext: this.search && this.search.hasNextPage(),
            hasPrevious: this.search && this.search.hasPreviousPage(),
            filteredSearch: this.search && this.search.entityType() == this.entityType,
            moreResults: (this.collection.models.length < this.collection.attributes.total),
            title: this.title(),
        };

        if(ctx.hasNext || ctx.hasPrevious) {
            ctx.currentPage = this.search.currentPageNumber();
            ctx.totalPages = this.search.totalPageNumber();
        }

        return ctx;
    },

    title: function() {
         return t("search.type." + this.options.entityType);
    },

    postRender: function() {
        var ul = this.$("ul");
        this.collection.each(function(model) {
            ul.append(this.makeListItemView(model).render().el);
        }, this);
    },

    showAll: function(e) {
        e && e.preventDefault();
        this.search.set({entityType: $(e.currentTarget).data("type")})
        chorus.router.navigate(this.search.showUrl(), true);
    },

    showNext: function(e) {
        e && e.preventDefault();
        this.search.getNextPage();
        this.render();
    },

    showPrevious: function(e) {
        e && e.preventDefault();
        this.search.getPreviousPage();
        this.render();
    },

    makeListItemView: function(model) {
        return new chorus.views[this.listItemConstructorName]({ model: model });
    }
});
