chorus.views.SearchWorkfileList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchWorkfileListView",
    className: "search_workfile_list",
    entityType: "workfile",

    makeListItemView: function(model) {
        return new chorus.views.SearchWorkfile({ model: model });
    }
});
