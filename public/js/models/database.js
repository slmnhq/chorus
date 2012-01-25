;(function(ns) {
    ns.models.Database = ns.models.Base.extend({
        schemas : function() {
            return new ns.collections.SchemaSet([], { instanceId : this.get("instanceId"), databaseId: this.get('id') });
        }
    });
})(chorus);
