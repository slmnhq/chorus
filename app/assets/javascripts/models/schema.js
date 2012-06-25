chorus.models.Schema = chorus.models.Base.extend({
    constructorName: "Schema",
    showUrlTemplate: "schemas/{{id}}",
    urlTemplate: "schemas/{{id}}",

    functions: function() {
        this._schemaFunctions = this._schemaFunctions || new chorus.collections.SchemaFunctionSet([], {
            id: this.get("id"),
            schemaName: this.get("name")
        });
        return this._schemaFunctions;
    },

    datasets: function() {
        if (!this._datasets) {
            this._datasets = new chorus.collections.DatasetSet([], { schemaId: this.id });
        }
        return this._datasets;
    },

    database: function() {
        return new chorus.models.Database(this.get("database"));
    },

    canonicalName: function() {
        return [this.database().instance().name(), this.database().name(), this.name()].join(".");
    },

    isEqual: function(other) {
        return this.get("id") === other.get("id");
    }
}, {
    DEFAULT_NAME: "public"
});
