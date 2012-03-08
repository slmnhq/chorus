chorus.collections.HdfsEntrySet = chorus.collections.Base.extend({
    constructorName: "HdfsEntrySet",
    model: chorus.models.HdfsEntry,

    setup: function() {
        this.attributes.encodedPath = encodeURIComponent(this.attributes.path);
    },

    urlTemplate: function() {
        return "data/{{instanceId}}/hdfs/{{encodedPath}}";
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
    }
});