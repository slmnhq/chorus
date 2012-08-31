chorus.models.ChorusViewPreviewTask = chorus.models.DataPreviewTask.extend({
    urlTemplateBase: "datasets/preview_sql",

    name: function() {
        return this.get("objectName") || t("dataset.sql.filename");
    }
});

