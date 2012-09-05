chorus.models.HdfsEntry = chorus.models.Base.extend({
    constructorName: "HdfsEntry",
    nameAttribute: 'name',
    entityType: "hdfs_file",

    urlTemplate: function() {
        return "hadoop_instances/{{hadoopInstance.id}}/files/{{id}}";
    },

    showUrlTemplate: function() {
        if(this.get("isDir")) {
            return "hadoop_instances/{{hadoopInstance.id}}/browse/{{id}}";
        } else {
            return "hadoop_instances/{{hadoopInstance.id}}/browseFile/{{id}}";
        }
    },

    getPath: function() {
        var encodedPath = encodeURIComponent((this.get("path") == "/") ? "" : this.get("path"));
        return encodedPath.replace(/%2F/g, "/");
    },

    getFullAbsolutePath: function() {
        return this.getPath() + '/' + this.get('name');
    },

    pathSegments: function() {
        return _.map(this.get("ancestors"), function(ancestor) {
            return new chorus.models.HdfsEntry(_.extend({isDir: true, hadoopInstance: this.get("hadoopInstance")}, ancestor));
        }, this).reverse();

    },

    parent: function() {
        return _.last(this.pathSegments());
    },

    getHadoopInstance: function() {
        return new chorus.models.HadoopInstance(this.get('hadoopInstance')).set({ instanceProvider: "Hadoop" })
    },

    iconUrl: function() {
        var name = this.get("name") || ""
        return chorus.urlHelpers.fileIconUrl(_.last(name.split(".")));
    }

});
