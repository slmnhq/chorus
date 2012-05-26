chorus.models.HdfsFile = chorus.models.Base.extend({
    constructorName: "HdfsFile",
    entityType: "hdfs",

    name: function() {
        splittedPath = this.attributes.path.split('/');
        return splittedPath[splittedPath.length - 1];
    },

    showUrlTemplate: function() {
        return "hadoop_instances/" + this.get('hadoopInstance').id + "/browseFile/" + encodeURIComponent(this.get("path"));
    },

    urlTemplate: function() {
        return "hadoop_instances/{{hadoopInstanceId}}/contents/" + encodeURIComponent(this.get("path"));
    },

    fileNameFromPath: function() {
        return this.attributes.path && _.last(this.attributes.path.split("/"));
    },

    iconUrl: function() {
        return chorus.urlHelpers.fileIconUrl(_.last(this.fileNameFromPath().split(".")));
    }
})
