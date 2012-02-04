chorus.models.Schema = chorus.models.Base.extend({
    urlTemplate:"data/{{instanceId}}/database/{{databaseName}}/schema/{{name}}",
    showUrlTemplate:"instances/{{instanceId}}/database/{{databaseName}}/schema/{{name}}",

    functions:function () {
        this._schemaFunctions = this._schemaFunctions || new chorus.collections.SchemaFunctionSet([], {
            instanceId:this.get("instanceId"),
            databaseId:this.get("databaseId"),
            schemaId:this.get("id"),
            schemaName:this.get('name')
        });
        return this._schemaFunctions;
    },

    tables:function () {
        if (!this._tables) {
            this._tables = new chorus.collections.DatabaseTableSet([], {
                instanceId:this.get("instanceId"),
                databaseName:this.get("databaseName"),
                schemaName:this.get("name")
            });
        }
        return this._tables;
    },

    views:function () {
        if (!this._views) {
            this._views = new chorus.collections.DatabaseViewSet([], {
                instanceId:this.get("instanceId"),
                databaseName:this.get("databaseName"),
                schemaName:this.get("name")
            });
        }
        return this._views;
    },

    canonicalName:function () {
        return [this.get("instanceName"), this.get("databaseName"), this.get("name")].join(" / ");
    },

    isEqual:function (other) {
        return _.all(["instanceId", "instanceName", "databaseId", "databaseName", "id", "name"], function (attr) {
            return this.get(attr) === other.get(attr)
        }, this)
    }
}, {
    DEFAULT_NAME:"public"
});