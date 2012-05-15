chorus.models.HdfsEntry = chorus.models.Base.extend({
    constructorName: "HdfsEntry",
    entityType: "hdfs",
    nameAttribute: 'name',

    showUrlTemplate: function() {
        if(this.get("isDir")) {
            return "instances/{{instance.id}}/browse" + this.getPath() + "/{{encode name}}";
        } else {
            return "instances/{{instance.id}}/browseFile" + this.getPath() + "/{{encode name}}";
        }
    },

    getPath: function() {
        var encodedPath = encodeURIComponent((this.get("path") == "/") ? "" : this.get("path"));
        return encodedPath.replace(/%2F/g, "/");
    },

    pathSegments: function() {
        return _.map(this.get("path").split("/").slice(1), function(path_i, i, whole_path) {
            var cur_path = "/" + whole_path.slice(0, i).join("/")
            return this.clone().set({ name: path_i, path: cur_path, isDir: true })
        }, this)
    },

    getInstance: function() {
        return new chorus.models.HadoopInstance(this.get('instance')).set({ instance_provider: "Hadoop" })
    }
});
