chorus.dialogs.ManageJoinTables = chorus.dialogs.Base.extend({
    className: "manage_join_tables",
    title: t("dataset.manage_join_tables.title"),

    events: {
        "click li": "tableClicked"
    },

    setup: function() {
        this.model = this.pageModel.schema();
        this.resource = this.collection = this.model.databaseObjects();
        this.collection.fetch();
    },

    postRender: function() {
        var originalId = this.pageModel.get("id");

        this.collection.remove(this.collection.get(originalId));
    },

    tableClicked: function(e) {
        var clickedLi = $(e.target).closest("li");
        this.$("li").removeClass("selected");
        clickedLi.addClass("selected");
    },

    additionalContext: function() {
        return { canonicalName: this.model.canonicalName() }
    },

    collectionModelContext: function(model) {
        return { iconUrl: model.iconUrl({ size: "small" })};
    }
});
