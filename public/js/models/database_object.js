chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    urlTemplate: function() {
        return "data/" + this.get("instance").id + "/database/{{databaseName}}/schema/{{schemaName}}/" + this.metaType() + "/{{objectName}}"
    },

    showUrlTemplate: "/",

    columns:function () {
        if (!this._columns) {
            this._columns = new chorus.collections.DatabaseColumnSet([], {
                instanceId:this.get("instanceId"),
                databaseName:this.get("databaseName"),
                schemaName:this.get("schemaName")
            });

            var objectNameField = this.metaType() + "Name";
            this._columns.attributes[objectNameField] = this.get("objectName");
        }
        return this._columns;
    },

    toText:function () {
        return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("objectName"));
    }
});
