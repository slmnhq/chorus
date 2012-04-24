chorus.models.ChorusViewPreviewTask = chorus.models.Task.extend({
    taskType: "getDatasetPreview",

    name: function() {
        return this.get("objectName") || t("dataset.sql.filename");
    }
});

