chorus.views.SearchInstanceList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchInstanceList",
    className: "search_instance_list",
    additionalClass: "list",
    entityType: "instance",

    makeListItemView: function(model) {
        return new chorus.views.SearchInstance({ model: model });
    }
});