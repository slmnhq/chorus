chorus.views.SearchInstanceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchInstanceList",
    className: "search_instance_list",
    additionalClass: "list",
    entityType: "instance",

    makeListItemView: function(model) {
        return new chorus.views.SearchInstance({ model: model });
    },

    postRender: function() {
        var ul = this.$("ul");
        this.collection.each(function(model) {
            ul.append(this.makeListItemView(model).render().el);
        }, this);
    }
});