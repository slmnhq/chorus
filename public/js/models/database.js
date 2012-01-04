;(function(ns) {
    ns.models.Database = ns.models.Base.extend({
        schemas : function() {
            return new ns.models.SchemaSet([], {instanceId : this.instanceId, databaseId: this.get('id')});
        }
    });
})(chorus);