chorus.collections.SchemaFunctionSet = chorus.collections.Base.extend({
    model:chorus.models.SchemaFunction,
    urlTemplate:"schemas/{{id}}/functions",

    comparator:function (schemaFunction) {
        return schemaFunction.get('name').toLowerCase();
    },

    _add:function (model, options) {
        model = this._super("_add", arguments);
        model.set({"schemaName":this.attributes.schemaName}, {silent:true});
        return model;
    }
});