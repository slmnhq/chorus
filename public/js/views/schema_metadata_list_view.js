(function($, ns) {
    ns.views.SchemaMetadataList = ns.views.Base.extend({
        className : "schema_metadata_list",
        additionalClass : "list",
        useLoadingSection : true,

        setup: function() {
            this.resource = this.collection = new chorus.models.Collection();
            this.schema = this.options.sandbox.schema();
            this.tables = this.schema.tables();
            this.views  = this.schema.views();

            this.tables.bind("reset", this.tableFetchComplete, this);
            this.tables.fetch();

            this.views.bind("reset", this.viewFetchComplete, this);
            this.views.fetch();
        },

        postRender: function() {
            this.$('.empty').addClass("hidden");
            if (this.collection && _.isEmpty(this.collection.models)) {
                this.$('.empty').removeClass("hidden");
            }
        },

        tableFetchComplete: function() {
            this.collection.add(this.tables.models);
            this.render();
        },

        viewFetchComplete: function() {
            this.collection.add(this.views.models);
            this.render();
        },

        additionalContext: function() {
            var models = _.clone(this.collection.models);
            models.sort(function(a, b) {
                return naturalSort(a.get("name").toLowerCase(), b.get("name").toLowerCase());
            });

            this.collection.models = models;
        },

        collectionModelContext : function(model) {
            return {
                name: model.get("name")
            }
        },

        displayLoadingSection : function() {
            return !(this.tables && this.tables.loaded && this.views && this.views.loaded);
        }
    });
})(jQuery, chorus);

