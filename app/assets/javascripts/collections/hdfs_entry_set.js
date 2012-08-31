chorus.collections.HdfsEntrySet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: "HdfsEntrySet",
    model: chorus.models.HdfsEntry,

    urlTemplate: function() {
        return "hadoop_instances/{{hadoopInstance.id}}/files/{{id}}";
    },

    modelAdded: function(model) {
        if (this.attributes.hadoopInstance) model.set({ hadoopInstance: this.attributes.hadoopInstance}, { silent: true });
        if (this.attributes.path) model.set({ path: this.attributes.path}, { silent: true });
    },

    hdfsEntry: function() {
//        var path = this.attributes.path;
//        var name = _.strRightBack(this.attributes.path, '/');
        var hadoopInstance = this.attributes.hadoopInstance;
        this._entry = this._entry || new chorus.models.HdfsEntry({ id: this.attributes.id, isDir: true, hadoopInstance: hadoopInstance });
        return this._entry;
    }
});
