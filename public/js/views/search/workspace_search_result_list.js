(function() {
    var viewConstructorMap = {
        workfile:       chorus.views.SearchWorkfile,
        databaseObject: chorus.views.SearchDataset,
        chorusView:     chorus.views.SearchDataset
    };

    chorus.views.WorkspaceSearchResultList = chorus.views.SearchResultList.extend({
        constructorName: "WorkspaceSearchResultList",

        makeListItemView: function(model) {
            var viewConstructor = viewConstructorMap[model.get("entityType")];
            return new viewConstructor({ model: model });
        }
    });
})();
