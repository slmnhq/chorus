window.fixtureDefinitions = {
    user: {
        model: "User",
        unique: [ "id" ]
    },

    workspace: {
        model: "Workspace",
        unique: [ "id", "sandboxInfo.sandboxId" ]
    },

    workspaceSet: {
        collection: "WorkspaceSet",
        unique: [ "id", "sandboxInfo.sandboxId" ]
    },

    userSet: {
        collection: "UserSet",
        unique: [ "id" ]
    },

    schema: {
        model: "Schema",
        unique: [ "id", "instance.id"]
    },

    schemaSet: {
        collection: "SchemaSet",
        unique: ["id"]
    },

    sandbox: {
        model: "Sandbox",
        unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ]
    },

    datasetSandboxTable: {
        model: "Dataset",
        unique: [ "id" ]
    },

    csvImport: {
        model: "CSVImport"
    }
};
