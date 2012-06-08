chorus.models.WorkspaceQuickstart = chorus.models.Base.extend({
    constructorName: "WorkspaceQuickstart",
    urlTemplate: "workspaces/{{workspaceId}}/quickstart",

    isNew: function() {
        return false;
    }
});
