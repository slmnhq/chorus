chorus.views.SearchResultList = chorus.views.Base.extend({
    constructorName: "SearchResultList",
    additionalClass: "list",
    className: "search_result_list",

    events: {
        "click a.show_all": "showAll"
    },

    setup: function() {
        this.search = this.options.search;
        this.entityType = this.options.entityType;
        this.listItemConstructorName = "Search" + _.capitalize(this.entityType);
    },

    additionalContext: function() {
        return {
            entityType: this.entityType,
            shown: this.collection.models.length,
            total: this.collection.pagination.records,
            filteredSearch: this.search && this.search.isPaginated(),
            moreResults: (this.collection.models.length < this.collection.pagination.records),
            title: this.title(),
        };
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
        e.preventDefault();
        this.search.set({entityType: $(e.currentTarget).data("type")})
        chorus.router.navigate(this.search.showUrl(), true);
    },

    makeListItemView: function(model) {
        return new chorus.views[this.listItemConstructorName]({ model: model, search: this.search });
    }
});
