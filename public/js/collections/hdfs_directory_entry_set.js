chorus.collections.HdfsDirectoryEntrySet = chorus.collections.Base.extend({
    constructorName: "HdfsDirectoryEntrySet",
    model: chorus.models.HdfsDirectoryEntry,

    setup: function() {
        this.attributes.encodedPath = encodeURIComponent(this.attributes.path);
    },

    urlTemplate: function() {
        return "data/{{instanceId}}/hdfs/{{encodedPath}}";
    }
});