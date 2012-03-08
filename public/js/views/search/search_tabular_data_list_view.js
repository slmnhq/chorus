chorus.views.SearchTabularDataList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchTabularDataListView",
    className: "search_tabular_data_list",
    entityType: "dataset",

    makeListItemView: function(model) {
        return new chorus.views.SearchTabularData({ model: model });
    }
});
