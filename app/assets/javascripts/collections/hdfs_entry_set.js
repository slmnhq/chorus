chorus.collections.HdfsEntrySet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: "HdfsEntrySet",
    model: chorus.models.HdfsEntry,

    urlTemplate: function() {
        return "hadoop_instances/{{hadoopInstance.id}}/files/{{encode path}}";
    },

    _add: function(model, options) {
        model = this._super("_add", arguments);
        this.attributes || (this.attributes = {});
        if (this.attributes.hadoopInstance) {
            model.set({ "hadoopInstance": this.attributes.hadoopInstance }, { silent: true });
        }
        if (this.attributes.path) {
            model.set({"path": this.attributes.path}, {silent: true});
        }
        return model;
    },

    hdfsEntry: function() {
        var path = _.strLeftBack(this.attributes.path, '/');
        var name = _.strRightBack(this.attributes.path, '/');
        var hadoopInstance = this.attributes.hadoopInstance;
        return new chorus.models.HdfsEntry({ name: name, path: path, isDir: true, hadoopInstance: hadoopInstance })
    }
});
