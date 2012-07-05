chorus.models.HdfsExternalTable = chorus.models.Base.extend({
    constructorName: 'HdfsExternalTable',
    urlTemplate: 'workspaces/{{workspaceId}}/external_tables',

    toJSON: function() {
        var hash = this._super('toJSON', arguments);
        hash.hdfs_external_table.pathname = hash.hdfs_external_table.path;
        delete hash.hdfs_external_table.path;
        return hash;
    }
});