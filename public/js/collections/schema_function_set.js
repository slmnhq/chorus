(function(ns) {
    ns.SchemaFunctionSet = ns.Collection.extend({
        model : ns.SchemaFunction,
        urlTemplate : "instance/{{instanceId}}/database/{{databaseId}}/schema/{{schemaId}}/function",

        comparator : function(schemaFunction) {
            return schemaFunction.get('functionName').toLowerCase();
        },

        _add : function(model, options) {
            model = this._super("_add", arguments);
            model.set({"schemaName": this.attributes.schemaName});
            return model;
        }

    });
})(chorus.models);