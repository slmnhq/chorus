chorus.collections.SchemaFunctionSet = chorus.collections.Base.extend({
    model:chorus.models.SchemaFunction,
    urlTemplate:"schemas/{{id}}/functions",

    comparator:function (schemaFunction) {
        return schemaFunction.get('name').toLowerCase();
    }
});