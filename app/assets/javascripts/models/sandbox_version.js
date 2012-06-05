chorus.models.SandboxVersion = chorus.models.Base.extend({
    constructorName: "SandboxVersion",

    urlTemplate:"workspace/{{workspaceId}}/sandboxDbVersion"
});