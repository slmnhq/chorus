(function(ns) {
    ns.models.DatabaseTableSet = ns.models.Collection.extend({
        model : ns.models.DatabaseTable,
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table",

        findByName: function(name) {
            return this.find(function(table) {
                return table.get("name") === name;
            });
        }
    });

})(chorus);
