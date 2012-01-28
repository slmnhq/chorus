chorus.models.Database = chorus.models.Base.extend({
    schemas:function () {
        return new chorus.collections.SchemaSet([], {
            instanceId:this.get("instanceId"),
            instanceName:this.get("instanceName"),
            databaseId:this.get('id'),
            databaseName:this.get("name")
        });
    }
});