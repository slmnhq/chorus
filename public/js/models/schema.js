;(function(ns) {
    ns.models.Schema = ns.models.Base.extend({
        functions: function() {
            this._schemaFunctions = this._schemaFunctions || new ns.models.SchemaFunctionSet([], {
                instanceId: this.get("instanceId"),
                databaseId: this.get("databaseId"),
                schemaId: this.get("id")
            });
            return this._schemaFunctions;
        }
    }, {
        DEFAULT_NAME: "public"
    });
})(chorus);
