chorus.models.HdfsFile = chorus.models.Base.extend({
    constructorName: "HdfsFile",
    entityType: "hdfs_file",

    name: function() {
        splittedPath = this.attributes.path.split('/');
        return splittedPath[splittedPath.length - 1];
    },

    getActivityStreamId: function() {
      return this.get('hadoopInstance').id + "|" + this.attributes.path;
    },

    showUrlTemplate: function() {
        return "hadoop_instances/" + this.get('hadoopInstance').id + "/browseFile/" + this.getPath();
    },

    getPath: function() {
        var encodedPath = encodeURIComponent((this.get("path") == "/") ? "" : this.get("path"));
        return encodedPath.replace(/%2F/g, "/").replace(/^\//, "");
    },

    urlTemplate: function() {
        return "hadoop_instances/" + this.get('hadoopInstance').id + "/contents/" + encodeURIComponent(this.get("path"));
    },

    fileNameFromPath: function() {
        return this.attributes.path && _.last(this.attributes.path.split("/"));
    },

    iconUrl: function() {
        return chorus.urlHelpers.fileIconUrl(_.last(this.fileNameFromPath().split(".")));
    }
});
