chorus.collections.SchemaFunctionSet = chorus.collections.Base.extend({
    model:chorus.models.SchemaFunction,
    urlTemplate:"instance/{{instanceId}}/database/{{encodeOnce databaseName}}/schema/{{encodeOnce schemaName}}/function",

    comparator:function (schemaFunction) {
        return schemaFunction.get('functionName').toLowerCase();
    },

    _add:function (model, options) {
        model = this._super("_add", arguments);
        model.set({"schemaName":this.attributes.schemaName}, {silent:true});
        return model;
    }
});