(function($, ns) {
    ns.views.SchemaMetadataList = ns.views.Base.extend({
        className : "schema_metadata_list",
        useLoadingSection : true,

        setup: function() {
            this.model.bind("change", this.fetchSandbox, this);
        },

        fetchSandbox: function() {
            this.model.sandbox().bind("change", this.fetchTables, this);
            this.model.sandbox().fetch();
        },

        fetchTables: function() {
            this.collection = this.model.sandbox().schema().tables();
            this.collection.bind("reset", this.render, this);
            this.collection.fetch();
        },
        
        collectionModelContext : function(model) {
            return {
                name: model.get("name")
            }
        }
    });
})(jQuery, chorus);

