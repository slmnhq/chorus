(function($, ns) {
    ns.views.SchemaMetadataList = ns.views.Base.extend({
        className : "schema_metadata_list",
        additionalClass : "list",
        useLoadingSection : true,

        setup: function() {
            this.model.bind("change", this.fetchSandbox, this);
        },

        postRender : function() {
            this.$('.empty').addClass("hidden");
            if (this.collection && _.isEmpty(this.collection.models)) {
                this.$('.empty').removeClass("hidden");
            }
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
        },

        displayLoadingSection : function() {
            return !(this.collection && this.collection.loaded);
        }
    });
})(jQuery, chorus);

