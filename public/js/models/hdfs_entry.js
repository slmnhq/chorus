chorus.models.HdfsEntry = chorus.models.Base.extend({
    constructorName: "HdfsEntry",
    entityType: "hdfs",
    nameAttribute: 'name',

    showUrlTemplate: function() {
        if(this.get("isDir")) {
            return "instances/{{instance.id}}/browse" + this.getPath() + "/{{name}}";
        } else {
            return "instances/{{instance.id}}/browseFile" + this.getPath() + "/{{name}}";
        }
    },

    getPath: function() {
        return (this.get("path") == "/") ? "" : this.get("path")
    },

    pathSegments: function() {
        return _.map(this.get("path").split("/").slice(1), function(path_i, i, whole_path) {
            var cur_path = "/" + whole_path.slice(0, i).join("/")
            return this.clone().set({ name: path_i, path: cur_path, isDir: true })
        }, this)
    },

    getInstance: function() {
        return new chorus.models.Instance(this.get('instance')).set({ instanceProvider: "Hadoop" })
    }
});