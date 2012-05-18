chorus.models.Database = chorus.models.Base.extend({
    constructorName: "Database",
    showUrlTemplate: "databases/{{id}}",
    urlTemplate: "databases/{{id}}",

    instance: function() {
        return new chorus.models.Instance({
            id: this.get("instance_id"),
            name: this.get("instance_name")
        })
    },

    schemas: function() {
        if (!this._schemas) {
            this._schemas = new chorus.collections.SchemaSet([], {
                instance_id: this.get("instance_id"),
                instance_name: this.get("instance_name"),
                database_id: this.get('id'),
                database_name: this.get('name')
            })
        }
        return this._schemas;
    }
});