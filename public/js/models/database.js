chorus.models.Database = chorus.models.Base.extend({
    constructorName: "Database",
    showUrlTemplate: "instances/{{instanceId}}/database/{{name}}",

    schemas:function () {
        if(!this._schemas) {
            this._schemas = new chorus.collections.SchemaSet([], {
                instanceId:this.get("instanceId"),
                instanceName:this.get("instanceName"),
                databaseId:this.get('id'),
                databaseName:this.get("name")
            })
        }
        return this._schemas;
    }
});