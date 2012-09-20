chorus.alerts.ImportScheduleDelete = chorus.alerts.ModelDelete.extend({
    constructorName: "ImportScheduleDelete",

    text: t("import.schedule.delete.text"),

    ok: t("import.schedule.delete.button"),
    deleteMessage: "import.schedule.delete.toast",

    setup: function() {
        this.title = t("import.schedule.delete.title", {destinationTableName: this.model.get("toTable")})
    },

    makeModel: function() {
        this._super("makeModel", arguments);
        this.model = this.pageModel.getImport();
    },

    modelDeleted: function() {
        this._super("modelDeleted", arguments);
        this.model.unset("id");
        this.pageModel.trigger("change");
    }
});
