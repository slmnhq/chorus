chorus.models.Database = chorus.models.Base.extend({
    constructorName: "Database",
    showUrlTemplate: "databases/{{id}}",
    urlTemplate: "databases/{{id}}",

    instance: function() {
        return new chorus.models.Instance(this.get("instance"))
    },

    schemas: function() {
        if (!this._schemas) {
            this._schemas = new chorus.collections.SchemaSet([], { databaseId: this.get('id') })
        }
        return this._schemas;
    }
});