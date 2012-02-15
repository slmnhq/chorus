chorus.dialogs.ManageJoinTables = chorus.dialogs.Base.extend({
    className: "manage_join_tables",
    title: t("dataset.manage_join_tables.title"),

    setup: function() {
        this.model = this.pageModel.schema();
        this.resource = this.collection = this.model.databaseObjects();
        this.collection.fetch();
    },

    postRender: function() {
        var originalId = this.pageModel.get("id");

        this.collection.remove(this.collection.get(originalId));
    },

    additionalContext: function() {
        return { canonicalName: this.model.canonicalName() }
    },

    collectionModelContext: function(model) {
        return { iconUrl: model.iconUrl({ size: "small" })};
    }
});
