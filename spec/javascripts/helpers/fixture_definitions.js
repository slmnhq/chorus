window.fixtureDefinitions = {
    user:    { unique: [ "id" ] },
    userSet: { unique: [ "id" ] },

    schema:    { unique: [ "id", "instance.id" ] },
    schemaSet: { unique: [ "id" ] },

    workspace:    { unique: [ "id", "sandboxInfo.sandboxId" ] },
    workspaceSet: { unique: [ "id", "sandboxInfo.sandboxId" ] },

    sandbox: { unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ] },

    csvImport: { model: "CSVImport" },

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
            id: function(a) {
                return '"' + [ a.instance.id, a.databaseName, a.schemaName, a.objectType, a.objectName, ].join('"|"') + '"';
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

    databaseObject: {
        derived: {
            id: function(a) {
                return '"' + [ a.instance.id, a.databaseName, a.schemaName, a.objectType, a.objectName, ].join('"|"') + '"';
            }
        },
    },

    test: {
        model:   "User",
        unique:  [ "id" ],

        children: {
            noOverrides: {},
            withOverrides: { model: "Workspace" }
        }
    }
};

