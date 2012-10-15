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
    comment: { model: "Comment" },
    csvImport: {  model: "CSVImport" },
    user:    { unique: [ "id" ] },
    userWithErrors: { model:'User' },
    userSet: { unique: [ "id" ] },
    kaggleUserSet: {},

    workspaceDataset: {
        unique: ["id"],
        children: {
            chorusView: {},
            datasetTable: {},
            datasetView: {},
            sourceTable: {},
            sourceView: {}
        }
    },

    databaseColumnSet: {},

    importSchedule: {
        model: 'DatasetImport',
        unique: ["scheduleInfo.id"]
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
            text: {},
            tableau: {}
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

    gnipInstance: {},

    image: {},

    greenplumInstance: { unique: [ "id" ] },
    database: {},

    instanceAccount: {},
    instanceAccountSet: {},

    instanceDetails: {
        model: 'InstanceUsage'
    },
    instanceDetailsWithoutPermission: {
        model: 'InstanceUsage'
    },

    forbiddenInstance: {},

    activity: {
        unique: [ "id" ],

        children :{
            greenplumInstanceCreated: {},
            gnipInstanceCreated: {},
            gnipStreamImportCreated: {},
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
            noteOnGnipInstanceCreated: {},
            noteOnGreenplumInstanceCreated: {},
            noteOnHadoopInstanceCreated: {},
            insightOnGreenplumInstance: {},
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
            workfileUpgradedVersion: {},
            chorusViewCreatedFromDataset: {},
            chorusViewCreatedFromWorkfile: {},
            chorusViewChanged: {},
            workspaceChangeName: {},
            tableauWorkbookPublished: {},
            tableauWorkfileCreated: {}

        }
    },

    notificationSet: {},

    searchResult : {},
    typeAheadSearchResult : {},
    emptySearchResult : {
        model: "SearchResult"
    },
    searchResultInWorkspace : {
        model: "SearchResult"
    },
    searchResultInWorkspaceWithEntityTypeWorkfile : {
        model: "SearchResult"
    },
    searchResultWithEntityTypeUser : {
        model: "SearchResult"
    },

    searchResultWithAttachmentOnInstanceNote : {
        model: "SearchResult"
    },

    searchResultWithAttachmentOnWorkspaceNote : {
        model: "SearchResult"
    },

    searchResultWithAttachmentOnWorkfileNote : {
        model: "SearchResult"
    },

    searchResultWithAttachmentOnDatasetNote : {
        model: "SearchResult"
    },

    searchResultWithAttachmentOnHdfsNote : {
        model: "SearchResult"
    },

    searchResultWithAttachmentOnHadoopNote : {
        model: "SearchResult"
    },

    searchResultWithAttachmentOnWorkspaceDatasetNote : {
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
    importSchedule: {
        model: "DatasetImport"
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
    dataset: { unique: [ "id" ] },
    dataPreviewTaskResults: {
        model: "DataPreviewTask"
    },

    schemaFunctionSet: {},

    hdfsFile: { model: "HdfsEntry" },
    hdfsDir: { model: "HdfsEntry" },

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

