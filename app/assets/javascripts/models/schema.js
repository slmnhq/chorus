chorus.models.Schema = chorus.models.Base.extend({
    constructorName: "Schema",
    showUrlTemplate:"instances/{{instance_id}}/databases/{{database_id}}/schemas/{{encode name}}",
    loaded: true,

    functions:function () {
        this._schemaFunctions = this._schemaFunctions || new chorus.collections.SchemaFunctionSet([], {
            instance_id:this.get("instance_id"),
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
                instance_id:this.get("instance_id"),
                databaseName:this.database().name(),
                schemaName:this.get("name")
            });
        }
        return this._databaseObjects;
    },

    database: function() {
        this._database = this._database || new chorus.models.Database({
            id:this.get("database_id"),
            name:this.get("database_name"),
            instance_id:this.get("instance_id"),
            instanceName:this.get("instanceName")
        });

        return this._database;
    },

    canonicalName:function () {
        return [this.get("instanceName"), this.database().name(), this.name()].join(".");
    },

    isEqual:function (other) {
        return _.all(["instance_id", "instanceName", "database_id", "id", "name"], function (attr) {
            return this.get(attr) === other.get(attr)
        }, this)
    }
}, {
    DEFAULT_NAME:"public"
});
