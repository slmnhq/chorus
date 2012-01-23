(function(ns) {
    ns.models.DatabaseTable = chorus.models.Base.extend({
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{name}}",

        columns: function() {
            if (!this._columns) {
                this._columns = new chorus.models.DatabaseColumnSet([], {
                    instanceId : this.get("instanceId"),
                    databaseName : this.get("databaseName"),
                    schemaName : this.get("schemaName"),
                    tableName : this.get("name")
                });
            }
            return this._columns;
        }
    });
})(chorus);
