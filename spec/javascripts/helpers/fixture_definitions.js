window.fixtureDefinitions = {
    user: {
        unique: [ "id" ]
    },

    workspace: {
        unique: [ "id", "sandboxInfo.sandboxId" ]
    },

    workspaceSet: {
        unique: [ "id", "sandboxInfo.sandboxId" ]
    },

    userSet: {
        unique: [ "id" ]
    },

    schema: {
        unique: [ "id", "instance.id" ]
    },

    schemaSet: {
        unique: ["id"]
    },

    sandbox: {
        unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ]
    },

    csvImport: {
        model: "CSVImport"
    },

    provisioningTemplate: {},

    provisioningTemplateSet: {},

    activity: {
        unique: [ "id" ],

        children: {
            provisioningSuccess: {},
            provisioningFail:    {}
        }
    },

    dataset: {
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
        },

        children: {
            sourceTable:   {},
            sourceView:    {},
            sandboxTable:  {},
            sandboxView:   {},
            chorusView:    {},
            externalTable: {}
        }
    },

    test: {
        model: "User",
        unique: [ "id" ],
        derived: { email: function(attrs) { return attrs.firstName + "@example.com"; } },

        children: {
            withOverrides: {
                model: "Workspace"
            },

            noOverrides: {}
        }
    }
};

