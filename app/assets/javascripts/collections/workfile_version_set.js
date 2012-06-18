chorus.collections.WorkfileVersionSet = chorus.collections.Base.extend({
    constructorName: "WorkfileVersionSet",
    urlTemplate:"workfiles/{{workfileId}}/versions",
    model:chorus.models.Workfile,
    comparator:function (model) {
        return -model.get("versionInfo").versionNum;
    }
});