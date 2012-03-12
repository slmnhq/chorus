(function() {
    var viewConstructorMap = {
        workfile:       chorus.views.SearchWorkfile,
        databaseObject: chorus.views.SearchDataset,
        chorusView:     chorus.views.SearchDataset
    };

    chorus.views.WorkspaceSearchResultList = chorus.views.SearchResultList.extend({
        constructorName: "WorkspaceSearchResultList",

        setup: function() {
            this._super("setup", arguments);
            this.requiredResources.add(this.query.workspace());
            this.query.workspace().fetch();
        },

        title: function() {
            return t("search.type.this_workspace", { name: this.query.workspace().get("name") });
        },

        makeListItemView: function(model) {
            var viewConstructor = viewConstructorMap[model.get("entityType")];
            return new viewConstructor({ model: model });
        }
    });
})();
