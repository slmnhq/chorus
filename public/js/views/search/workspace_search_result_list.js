(function() {
    var viewConstructorMap = {
        workfile:       chorus.views.SearchWorkfile,
        databaseObject: chorus.views.SearchDataset,
        chorusView:     chorus.views.SearchDataset
    };

    chorus.views.WorkspaceSearchResultList = chorus.views.SearchResultList.extend({
        constructorName: "WorkspaceSearchResultList",

        title: function() {
            return t("search.type.this_workspace", { name: this.search.workspace().get("name") });
        },

        makeListItemView: function(model) {
            var viewConstructor = viewConstructorMap[model.get("entityType")];
            return new viewConstructor({ model: model });
        },

        showAll: function(e) {
            e.preventDefault();
            this.search.set({ searchIn: "this_workspace" });
            chorus.router.navigate(this.search.showUrl(), true);
        }
    });
})();
