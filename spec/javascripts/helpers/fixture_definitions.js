window.fixtureDefinitions = {
    user: {
        model: "User",
        unique: [ "id" ]
    },

    workspace: {
        model: "Workspace",
        unique: [ "id", "sandboxInfo.sandboxId" ]
    }
};
