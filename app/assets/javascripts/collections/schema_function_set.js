chorus.collections.SchemaFunctionSet = chorus.collections.Base.extend({
    model:chorus.models.SchemaFunction,
    urlTemplate:"instance/{{instance_id}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/function",

    comparator:function (schemaFunction) {
        return schemaFunction.get('functionName').toLowerCase();
    },

    _add:function (model, options) {
        model = this._super("_add", arguments);
        model.set({"schemaName":this.attributes.schemaName}, {silent:true});
        return model;
    }
});