(function($, ns) {
    ns.views.DatabaseFunctionList = ns.views.DatabaseList.extend({
        className : "database_function_list",
        useLoadingSection: true,

        collectionModelContext: function(schemaFunction) {
            return {
                hintText: schemaFunction.toHintText(),
                cid: schemaFunction.cid
            }
        },

        fetchResourceAfterSchemaSelected: function(schema) {
            this.resource = this.collection = schema.functions();
            this.bindings.add(this.resource, "change reset add remove", this.render);
            this.collection.fetch();
        }
    });
})(jQuery, chorus);
