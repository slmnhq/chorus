chorus.models.Database = chorus.models.Base.extend({
    constructorName: "Database",
    showUrlTemplate: "instances/{{instance_id}}/databases/{{encode name}}",

    schemas:function () {
        if(!this._schemas) {
            this._schemas = new chorus.collections.SchemaSet([], {
                instance_id:this.get("instance_id"),
                instanceName:this.get("instanceName"),
                databaseId:this.get('id'),
                databaseName:this.get("name")
            })
        }
        return this._schemas;
    }
});