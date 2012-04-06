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
    }
};
