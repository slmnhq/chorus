chorus.views.SearchTabularDataList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchTabularDataListView",
    className: "search_tabular_data_list",
    additionalClass: "list",
    entityType: "dataset",

    makeListItemView: function(model) {
        return new chorus.views.SearchTabularData({ model: model });
    },

    postRender: function() {
        var ul = this.$("ul");
        this.collection.each(function(model) {
            ul.append(this.makeListItemView(model).render().el);
        }, this);
    }
});
