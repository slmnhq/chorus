chorus.models.GnipStream = chorus.models.Base.extend({
    constructorName: "GnipInstance",
    urlTemplate: "gnip_instances/{{gnip_instance_id}}/imports",
    parameterWrapper: "import",

    declareValidations: function(newAttrs) {
        this.requirePattern("toTable", chorus.ValidationRegexes.ChorusIdentifier(), newAttrs, "import.validation.toTable.required");
        this.require("workspaceId", newAttrs);
    }
});