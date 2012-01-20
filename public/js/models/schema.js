;(function(ns) {
    ns.models.Schema = ns.models.Base.extend({
        urlTemplate: "/data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}",
        
        functions: function() {
            this._schemaFunctions = this._schemaFunctions || new ns.models.SchemaFunctionSet([], {
                instanceId: this.get("instanceId"),
                databaseId: this.get("databaseId"),
                schemaId: this.get("id")
            });
            return this._schemaFunctions;
        },

        tables: function() {
            if(!this._tables) {
                this._tables = new chorus.models.TableSet([], {
                    instanceId : this.get("instanceId"),
                    databaseName : this.get("databaseName"),
                    schemaName : this.get("name")
                });
            }
            return this._tables;
        }
    }, {
        DEFAULT_NAME: "public"
    });
})(chorus);
