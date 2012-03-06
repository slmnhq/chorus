chorus.models.HdfsFile = chorus.models.Base.extend({
    constructorName: "HdfsFile",

    urlTemplate: function() {
        return "data/{{instanceId}}/hdfs/{{path}}/sample";
    },

    fileNameFromPath: function() {
        return this.attributes.path && _.last(this.attributes.path.split("%2F"))
    },

    iconUrl: function() {
        return chorus.urlHelpers.fileIconUrl(_.last(this.fileNameFromPath().split(".")));
    }
})