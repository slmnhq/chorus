chorus.collections.TabularDataSet = chorus.collections.Base.extend({
    model:chorus.models.DynamicTabularData,

    _add:function (model, options) {
        model = this._super("_add", arguments);

        //todo remove this when TYPE comes from the API
        if (model instanceof chorus.models.DatabaseObject) {
            model.set({type: "SOURCE_TABLE"}, {silent:true});
        } else {
            model.set({type: "CHORUS_VIEW"}, {silent:true});
        }

        return model;
    }
});