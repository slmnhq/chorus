chorus.models.Schema = chorus.models.Base.extend({
    constructorName: "Schema",
    showUrlTemplate:"instances/{{instanceId}}/databases/{{encode databaseName}}/schemas/{{encode name}}",
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

    database: function() {
        this._database = this._database || new chorus.models.Database({
            id:this.get("databaseId"),
            name:this.get("databaseName"),
            instanceId:this.get("instanceId"),
            instanceName:this.get("instanceName")
        });

        return this._database;
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
