chorus.collections.HdfsEntrySet = chorus.collections.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: "HdfsEntrySet",
    model: chorus.models.HdfsEntry,

    urlTemplate: function() {
        return "data/{{instance.id}}/hdfs/{{encodeOnce path}}";
    },

    _add: function(model, options) {
        model = this._super("_add", arguments);
        this.attributes || (this.attributes = {});
        if (this.attributes.instance) {
            model.set({ "instance": this.attributes.instance }, { silent: true });
        }
        if (this.attributes.path) {
            model.set({"path": this.attributes.path}, {silent: true});
        }
        return model;
    },

    hdfsEntry: function() {
        var path = _.strLeftBack(this.attributes.path, '/');
        var name = _.strRightBack(this.attributes.path, '/');
        var instance = this.attributes.instance;
        return new chorus.models.HdfsEntry({ name: name, path: path, isDir: true, instance: instance })
    }
});
