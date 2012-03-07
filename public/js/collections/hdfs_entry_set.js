chorus.collections.HdfsEntrySet = chorus.collections.Base.extend({
    constructorName: "HdfsEntrySet",
    model: chorus.models.HdfsEntry,

    setup: function() {
        this.attributes.encodedPath = encodeURIComponent(this.attributes.path);
    },

    urlTemplate: function() {
        return "data/{{instanceId}}/hdfs/{{encodedPath}}";
    }
});