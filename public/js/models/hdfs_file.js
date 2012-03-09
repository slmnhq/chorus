chorus.models.HdfsFile = chorus.models.Base.extend({
    constructorName: "HdfsFile",
    entityType: "hdfs",

    urlTemplate: function() {
        return "data/{{instanceId}}/hdfs/" + encodeURIComponent(this.get("path")) + "/sample";
    },

    fileNameFromPath: function() {
        return this.attributes.path && _.last(this.attributes.path.split("/"));
    },

    iconUrl: function() {
        return chorus.urlHelpers.fileIconUrl(_.last(this.fileNameFromPath().split(".")));
    }
})
