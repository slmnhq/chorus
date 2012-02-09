chorus.models.DatabaseTable = chorus.models.Base.extend({
    urlTemplate:"data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{objectName}}",

    columns:function () {
        if (!this._columns) {
            this._columns = new chorus.collections.DatabaseColumnSet([], {
                instanceId:this.get("instanceId"),
                databaseName:this.get("databaseName"),
                schemaName:this.get("schemaName"),
                tableName:this.get("objectName")
            });
        }
        return this._columns;
    },

    toText:function () {
        return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("objectName"));
    }
});