chorus.models.HdfsFile = chorus.models.Base.extend({
    constructorName: "HdfsFile",
    entityType: "hdfs",

    name: function() {
        return this.attributes.name;
    },

    showUrlTemplate: function() {
        return "instances/" + this.get('instance').id + "/browseFile/" + this.get("path") + "/" + this.get("name");
    },

    urlTemplate: function() {
        return "data/{{instance_id}}/hdfs/" + encodeURIComponent(this.get("path")) + "/sample";
    },

    fileNameFromPath: function() {
        return this.attributes.path && _.last(this.attributes.path.split("/"));
    },

    iconUrl: function() {
        return chorus.urlHelpers.fileIconUrl(_.last(this.fileNameFromPath().split(".")));
    }
})
