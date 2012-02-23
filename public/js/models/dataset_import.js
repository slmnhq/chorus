chorus.models.DatasetImport = chorus.models.Base.extend({
    urlTemplate: "workspace/{{workspaceId}}/dataset/{{datasetId}}/import",

    declareValidations:function (newAttrs) {
        this.requirePattern("tableName", /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/, newAttrs);

        if (newAttrs.useLimitRows) {
            this.requirePositiveInteger("rowLimit", newAttrs);
        }
    }
});
