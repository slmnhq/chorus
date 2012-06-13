chorus.models.Draft = chorus.models.Base.extend({
    urlTemplate:"workfiles/{{workfileId}}/draft",
    parameterWrapper: "draft"
});