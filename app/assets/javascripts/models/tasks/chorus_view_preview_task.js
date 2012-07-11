chorus.models.ChorusViewPreviewTask = chorus.models.Task.extend({
    urlTemplateBase: "datasets/{{datasetId}}/previews",

    name: function() {
        return this.get("objectName") || t("dataset.sql.filename");
    }
});

