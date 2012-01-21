(function(ns) {
    ns.models.DatabaseColumnSet = ns.models.Collection.extend({
        model : ns.models.DatabaseColumn,

        urlTemplate: function() {
            if (this.attributes.tableName) {
                return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{tableName}}/column";
            } else if (this.attributes.viewName) {
                return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view/{{viewName}}/column";
            }
        }
    });
})(chorus);
