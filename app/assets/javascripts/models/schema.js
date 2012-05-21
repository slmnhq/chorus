chorus.models.Schema = chorus.models.Base.extend({
    constructorName: "Schema",
    showUrlTemplate:"schemas/{{id}}",
    urlTemplate: "schemas/{{id}}",

    functions:function () {
        this._schemaFunctions = this._schemaFunctions || new chorus.collections.SchemaFunctionSet([], {
            instanceId:this.get("instanceId"),
            databaseId:this.database().id,
            // TODO Is databaseName used?
            databaseName:this.database().name(),
            schemaId:this.get("id"),
            schemaName:this.get('name')
        });
        return this._schemaFunctions;
    },

    databaseObjects: function () {
        if (!this._databaseObjects) {
            this._databaseObjects = new chorus.collections.DatabaseObjectSet([], {
                schemaId: this.id,
                instanceId: "REMOVEME",
                databaseName: "REMOVEME",
                schemaName: "REMOVEME"
            });
        }
        return this._databaseObjects;
    },

    database: function() {
        return new chorus.models.Database({
            id: this.get("databaseId"),
            name: this.get("databaseName"),
            instanceId: this.get("instanceId"),
            instanceName: this.get("instanceName")
        });
    },

    canonicalName:function () {
        return [this.database().instance().name(), this.database().name(), this.name()].join(".");
    },

    isEqual:function (other) {
        return _.all(["instanceId", "instanceName", "databaseId", "id", "name"], function (attr) {
            return this.get(attr) === other.get(attr)
        }, this)
    }
}, {
    DEFAULT_NAME:"public"
});
