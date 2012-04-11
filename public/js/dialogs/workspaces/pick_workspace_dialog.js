chorus.dialogs.PickWorkspace = chorus.dialogs.PickItems.extend({
    title: t("dataset.associate.title"),
    constructorName: "PickWorkspaceDialog",
    submitButtonTranslationKey: "dataset.associate.button",
    emptyListTranslationKey: "dataset.associate.empty.placeholder",
    searchPlaceholderKey: "dataset.associate.search",
    selectedEvent: 'files:selected',
    modelClass: "Workspace",

    events: {
        "click button.submit": "doCallback"
    },

    setup: function() {
        this._super("setup");
    },

    additionalContext: function() {
        var ctx = this._super("additionalContext", arguments);

        return _.extend(ctx, {
            serverErrors: this.serverErrors
        });
    },

    makeModel: function() {
        this.pageModel = this.options.pageModel;
        this.collection = this.collection || this.defaultWorkspaces();
        this.collection.fetchAll();
        this.bindings.add(this.collection, "reset", this.render);
    },

    defaultWorkspaces: function() {
        if (this.options.activeOnly || (this.options.launchElement && this.options.launchElement.data("activeOnly"))) {
            return chorus.session.user().activeWorkspaces();
        }
        return chorus.session.user().workspaces();
    },

    collectionModelContext: function(model) {
        return {
            name: model.name(),
            imageUrl: model.defaultIconUrl("small")
        }
    }
});
