chorus.models.GnipStream = chorus.models.Base.extend({
    constructorName: "GnipInstance",
    urlTemplate: "somewhere",

    declareValidations: function(newAttrs) {
        this.requirePattern("toTable", chorus.ValidationRegexes.ChorusIdentifier(), newAttrs, "import.validation.toTable.required");
        this.require("workspaceId", newAttrs);
    }
});