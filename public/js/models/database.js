;(function(ns) {
    ns.models.Database = ns.models.Base.extend({
        schemas : function() {
            return new ns.collections.SchemaSet([], {
                instanceId : this.get("instanceId"),
                instanceName : this.get("instanceName"),
                databaseId: this.get('id'),
                databaseName : this.get("name")
            });
        }
    });
})(chorus);
