chorus.collections.HdfsEntrySet = chorus.collections.Base.extend({
    constructorName: "HdfsEntrySet",
    model: chorus.models.HdfsEntry,

    setup: function() {
        this.attributes.encodedPath = encodeURIComponent(this.attributes.path);
    },

    urlTemplate: function() {
        return "data/{{instance.id}}/hdfs/{{encodedPath}}";
    },

    _add: function(model, options) {
        model = this._super("_add", arguments);
        if(this.attributes.instance) {
            model.set({"instance": this.attributes.instance}, {silent: true});
        }
        if(this.attributes.path) {
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