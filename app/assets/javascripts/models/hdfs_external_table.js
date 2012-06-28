chorus.models.HdfsExternalTable = chorus.models.Base.extend({
    constructorName: 'HdfsExternalTable',
    urlTemplate: 'workspaces/{{workspaceId}}/external_tables'
});