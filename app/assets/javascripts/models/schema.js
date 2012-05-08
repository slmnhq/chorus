chorus.models.Schema = chorus.models.Base.extend({
    constructorName: "Schema",
    showUrlTemplate:"instances/{{instance_id}}/databases/{{encode databaseName}}/schemas/{{encode name}}",
    loaded: true,

    functions:function () {
        this._schemaFunctions = this._schemaFunctions || new chorus.collections.SchemaFunctionSet([], {
            instance_id:this.get("instance_id"),
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
                instance_id:this.get("instance_id"),
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
            instance_id:this.get("instance_id"),
            instanceName:this.get("instanceName")
        });

        return this._database;
    },

    canonicalName:function () {
        return [this.get("instanceName"), this.get("databaseName"), this.get("name")].join(".");
    },

    isEqual:function (other) {
        return _.all(["instance_id", "instanceName", "databaseId", "databaseName", "id", "name"], function (attr) {
            return this.get(attr) === other.get(attr)
        }, this)
    }
}, {
    DEFAULT_NAME:"public"
});
