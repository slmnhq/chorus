chorus.models.CSVImport = chorus.models.Base.extend({
    constructorName: "CSVImport",
    urlTemplate: "workspace/{{workspaceId}}/csv/import",

    declareValidations:function (newAttrs) {
        if (this.get("type") !== "existingTable") {
            this.requirePattern('toTable', chorus.ValidationRegexes.ChorusIdentifier64(), newAttrs, "import.validation.toTable.required");
        }
    }
});
