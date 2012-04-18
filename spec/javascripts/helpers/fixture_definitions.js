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
        unique: [ "id", "instance.id" ]
    },

    schemaSet: {
        collection: "SchemaSet",
        unique: ["id"]
    },

    sandbox: {
        model: "Sandbox",
        unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ]
    },

    csvImport: {
        model: "CSVImport"
    },

    activities: {
        provisioningSuccess: {
            model: "Activity",
            unique: [ "id" ]
        },
        provisioningFail: {
            model: "Activity",
            unique: [ "id" ]
        }
    },

    provisioningTemplate: {
        model: "ProvisioningTemplate"
    },

    provisioningTemplateSet: {
        collection: "ProvisioningTemplateSet"
    }
};

fixtureDefinitions.datasetSourceTable   =
fixtureDefinitions.datasetSourceView    =
fixtureDefinitions.datasetSandboxTable  =
fixtureDefinitions.datasetSandboxView   =
fixtureDefinitions.datasetChorusView    =
fixtureDefinitions.datasetExternalTable = {
    model: "Dataset",
    derived: {
        id: function(attrs) {
            return '"' + [
                attrs.instance.id,
                attrs.databaseName,
                attrs.schemaName,
                attrs.objectType,
                attrs.objectName,
            ].join('"|"') + '"';
        }
    }
};


