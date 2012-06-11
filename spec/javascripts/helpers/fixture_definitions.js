window.fixtureDefinitions = {
    schema:    { unique: [ "id", "instance.id" ] },

    workspaceSet: { unique: [ "id", "sandboxInfo.sandboxId" ] },

    sandbox: { unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ] },

    csvImport: { model: "CSVImport" },

    provisioningTemplate: {},
    provisioningTemplateSet: {},

    config: {},

    activity: {
        unique: [ "id" ],

        children: {
            provisioningSuccess: {},
            provisioningFail:    {},
            addHdfsPatternAsExtTable: {},
            addHdfsDirectoryAsExtTable: {}
        }
    },

    dataset: {
        derived: {
            id: function(a) {
                return '"' + [ a.instance.id, a.databaseName, a.schemaName, a.objectType, a.objectName ].join('"|"') + '"';
            }
        },

        children: {
            sourceTable:   {},
            sourceView:    {},
            sandboxTable:  {},
            sandboxView:   {},
            chorusView:    {},
            chorusViewSearchResult: {},
            externalTable: {}
        }
    },

    databaseObject: {
        unique: [ "id" ]
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

window.rspecFixtureDefinitions = {
    user:    { unique: [ "id" ] },
    userSet: { unique: [ "id" ] },

    schema:    { unique: [ "id", "database.id", "database.instance.id" ] },
    schemaSet: { unique: [ "id" ] },
//
    workspace:    { unique: [ "id", "sandboxInfo.sandboxId" ] },
    workspaceSet: { unique: [ "id", "sandboxInfo.sandboxId" ] },

    workfile: {
        unique: [ "id" ],
        children: {
            sql: {},
            binary: {},
            image: {},
            text: {}
        }
    },

//    sandbox: { unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ] },
//
//    csvImport: { model: "CSVImport" },
//
//    provisioningTemplate: {},
//    provisioningTemplateSet: {},
//
//    config: {},
//
    hadoopInstance: {},

    image: {},

    greenplumInstance: { unique: [ "id" ] },
//
//        children: {
//            greenplum:      {},
//            sharedAccount:  {}
//        }
//    },

    instanceAccount: {},
    instanceAccountSet: {}

//    activity: {
//        unique: [ "id" ],
//
//        children: {
//            provisioningSuccess: {},
//            provisioningFail:    {},
//            addHdfsPatternAsExtTable: {},
//            addHdfsDirectoryAsExtTable: {}
//        }
//    },
//
//    dataset: {
//        derived: {
//            id: function(a) {
//                return '"' + [ a.instance.id, a.databaseName, a.schemaName, a.objectType, a.objectName ].join('"|"') + '"';
//            }
//        },
//
//        children: {
//            sourceTable:   {},
//            sourceView:    {},
//            sandboxTable:  {},
//            sandboxView:   {},
//            chorusView:    {},
//            chorusViewSearchResult: {},
//            externalTable: {}
//        }
//    },
//
//    databaseObject: {
//        unique: [ "id" ]
//    },
//
//    test: {
//        model:   "User",
//        unique:  [ "id" ],
//
//        children: {
//            noOverrides: {},
//            withOverrides: { model: "Workspace" }
//        }
//    }
};

