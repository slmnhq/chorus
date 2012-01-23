(function(ns) {
    ns.models.DatabaseViewSet = ns.models.Collection.extend({
        model : ns.models.DatabaseView,
        urlTemplate : "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view",

        // copied from DatabaseTableSet. maybe extract later
        findByName: function(name) {
            return this.find(function(table) {
                return table.get("name") === name;
            });
        }
    });
})(chorus);
