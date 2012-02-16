chorus.models.Schema = chorus.models.Base.extend({
    showUrlTemplate:"instances/{{instanceId}}/database/{{databaseName}}/schema/{{name}}",
    loaded: true,

    functions:function () {
        this._schemaFunctions = this._schemaFunctions || new chorus.collections.SchemaFunctionSet([], {
            instanceId:this.get("instanceId"),
            databaseId:this.get("databaseId"),
            databaseName:this.get("databaseName"),
            schemaId:this.get("id"),
            schemaName:this.get('name')
        });
        return this._schemaFunctions;
    },

    databaseObjects: function () {
        if (!this._databaseObjects) {
            this._databaseObjects = new chorus.collections.DatabaseObjectSet([], {
                instanceId:this.get("instanceId"),
                databaseName:this.get("databaseName"),
                schemaName:this.get("name")
            });
        }
        return this._databaseObjects;
    },

    canonicalName:function () {
        return [this.get("instanceName"), this.get("databaseName"), this.get("name")].join(".");
    },

    isEqual:function (other) {
        return _.all(["instanceId", "instanceName", "databaseId", "databaseName", "id", "name"], function (attr) {
            return this.get(attr) === other.get(attr)
        }, this)
    }
}, {
    DEFAULT_NAME:"public"
});
