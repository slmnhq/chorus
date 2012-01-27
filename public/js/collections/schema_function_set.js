(function(ns) {
    ns.collections.SchemaFunctionSet = ns.collections.Base.extend({
        model : ns.models.SchemaFunction,
        urlTemplate : "instance/{{instanceId}}/database/{{databaseId}}/schema/{{schemaId}}/function",

        comparator : function(schemaFunction) {
            return schemaFunction.get('functionName').toLowerCase();
        },

        _add : function(model, options) {
            model = this._super("_add", arguments);
            model.set({"schemaName": this.attributes.schemaName}, {silent: true});
            return model;
        }

    });
})(chorus);
