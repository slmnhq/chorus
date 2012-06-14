window.fixtureDefinitions = {
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

    dataset: { unique: ["id"] },

    schema:    { unique: [ "id", "database.id", "database.instance.id" ] },
    schemaSet: { unique: [ "id" ] },

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
    workfileSet: {},

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
    database: {},

    instanceAccount: {},
    instanceAccountSet: {},

    activity: {
        children :{
            instanceCreated: {}
        }
    },


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
    databaseObject: { unique: [ "id" ] }
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

