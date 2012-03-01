chorus.collections.HdfsDirectoryEntrySet = chorus.collections.Base.extend({
    constructorName: "HdfsDirectoryEntrySet",
    model: chorus.models.HdfsDirectoryEntry,

    setup: function() {
        this.attributes.encodedPath = encodeURIComponent(this.attributes.path);
    },

    urlTemplate: function() {
        return "data/{{instanceId}}/hdfs/{{encodedPath}}";
    },

    parse: function(data) {
        // temporary fix until backend bug fix
        if (data.resource[0].content) {
            data.resource = data.resource[0].content;
        }

        return this._super("parse", [data]);
    }
});