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

    workspaceDataset: {
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
    csvImport: {  model: "CSVImport" },
    user:    { unique: [ "id" ] },
    userSet: { unique: [ "id" ] },

    workspaceDataset: {
        unique: ["id"],
        children: {
            datasetTable: {},
            datasetView: {}
        }
    },

    schema:    { unique: [ "id", "database.id", "database.instance.id" ] },
    schemaSet: { unique: [ "id" ] },

    workspace:    { unique: [ "id" ] },
    workspaceSet: { unique: [ "id" ] },

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

    workfileVersion: {},

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

    forbiddenInstance: {},

    activity: {
        unique: [ "id" ],

        children :{
            greenplumInstanceCreated: {},
            greenplumInstanceChangedOwner: {},
            hadoopInstanceCreated: {},
            greenplumInstanceChangedName: {},
            hadoopInstanceChangedName: {},
            publicWorkspaceCreated: {},
            privateWorkspaceCreated: {},
            workfileCreated: {},
            sourceTableCreated: {},
            userCreated: {},
            sandboxAdded: {},
            noteOnGreenplumInstanceCreated: {},
            noteOnHadoopInstanceCreated: {},
            hdfsExternalTableCreated: {},
            importSuccess: {},
            noteOnHdfsFileCreated: {},
            noteOnWorkspaceCreated: {},
            noteOnDatasetCreated: {},
            noteOnWorkspaceDatasetCreated: {},
            noteOnWorkfileCreated: {}
        }
    },

    searchResult : {},
    emptySearchResult : {
        model: "SearchResult"
    },

    frequencyTask: {},
    heatmapTask: {},
    boxplotTask: {},
    timeseriesTask: {},
    histogramTask: {},

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
    dataset: { unique: [ "id" ] },

    schemaFunctionSet: {},

    hdfsFile: { model: "HdfsFile"}

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

