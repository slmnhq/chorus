chorus.models.HdfsEntry = chorus.models.Base.extend({
    constructorName: "HdfsEntry",
    entityType: "hdfs",

    showUrlTemplate: function() {
        if(this.get("isDir")) {
            return "instances/{{instance.id}}/browse" + this.getPath() + "/{{name}}";
        } else {
            return "instances/{{instance.id}}/browseFile" + this.getPath() + "/{{name}}";
        }
    },

    getPath: function() {
        return (this.get("path") == "/") ? "" : this.get("path")
    }
});