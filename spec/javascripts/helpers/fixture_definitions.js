window.fixtureDefinitions = {
    sandbox: { unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ] },

    csvImport: { model: "CSVImport" },

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
                return a.id;
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
    userWithErrors: { model:'User' },
    userSet: { unique: [ "id" ] },

    workspaceDataset: {
        unique: ["id"],
        children: {
            chorusView: {},
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
    draft: {},
    provisioning: {},

//    sandbox: { unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ] },
//
//    csvImport: { model: "CSVImport" },
//
//    provisioningTemplate: {},
//    provisioningTemplateSet: {},
//
    config: {},

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
            auroraInstanceProvisioned: {},
            auroraInstanceProvisioningFailed: {},
            greenplumInstanceChangedOwner: {},
            hadoopInstanceCreated: {},
            greenplumInstanceChangedName: {},
            hadoopInstanceChangedName: {},
            publicWorkspaceCreated: {},
            privateWorkspaceCreated: {},
            workspaceMakePublic: {},
            workspaceMakePrivate: {},
            workspaceArchived: {},
            workspaceUnarchived: {},
            workfileCreated: {},
            sourceTableCreated: {},
            userCreated: {},
            sandboxAdded: {},
            noteOnGreenplumInstanceCreated: {},
            noteOnHadoopInstanceCreated: {},
            hdfsExternalTableCreated: {},
            fileImportCreated: {},
            fileImportFailed: {},
            fileImportSuccess: {},
            datasetImportCreated:{},
            datasetImportFailed: {},
            datasetImportSuccess: {},
            noteOnHdfsFileCreated: {},
            noteOnWorkspaceCreated: {},
            noteOnDatasetCreated: {},
            noteOnWorkspaceDatasetCreated: {},
            noteOnWorkfileCreated: {},
            membersAdded: {},
            workfileUpgradedVersion: {}
        }
    },

    searchResult : {},
    emptySearchResult : {
        model: "SearchResult"
    },

    frequencyTask: {},
    frequencyTaskWithErrors: {
        model: 'FrequencyTask'
    },
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
    dataPreviewTaskResults: {
        model: "DataPreviewTask"
    },

    schemaFunctionSet: {},

    hdfsFile: { model: "HdfsFile" },

    workfileExecutionResults: {
        model: "WorkfileExecutionTask"
    },

    workfileExecutionResultsWithWarning: {
        model: "WorkfileExecutionTask"
    },

    workfileExecutionResultsEmpty: {
        model: "WorkfileExecutionTask"
    },

    workfileExecutionError: {
        model: "WorkfileExecutionTask"
    }
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

