chorus.models.CSVImport = chorus.models.Base.extend({
    constructorName: "CSVImport",
    urlTemplate: "workspaces/{{workspaceId}}/csv/{{id}}/import",

    declareValidations:function (newAttrs) {
        if (this.get("type") !== "existingTable") {
            this.requirePattern('toTable', chorus.ValidationRegexes.ChorusIdentifier64(), newAttrs, "import.validation.toTable.required");
        }
    },

    toJSON: function() {
        var hash = this._super('toJSON', arguments);
        delete hash.csvimport.contents;
        return hash;
    }
});
