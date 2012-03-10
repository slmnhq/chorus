chorus.collections.TabularDataSet = chorus.collections.Base.extend({
    model:chorus.models.DynamicTabularData,

    _add:function (model, options) {
        model = this._super("_add", arguments);

        if (!model.has("type")) {
            model.set({type: model.get("datasetType") || "SOURCE_TABLE"}, {silent: true})
        }

        return model;
    }
});