(function($, ns) {
    ns.views.DatabaseFunctionList = ns.views.DatabaseList.extend({
        className : "database_function_list",
        useLoadingSection: true,

        events: {
            "click .context a": "contextClicked"
        },

        setup: function() {
            this.sandbox = this.options.sandbox;
            this.schemas = this.sandbox.database().schemas();
            this.schemas.fetch();
            this.setSchema(this.sandbox.schema());
        },

        additionalContext: function() {
            return {
                schemaLink: ns.helpers.linkTo("#", this.schema.get('name')),
                schemas: this.schemas.map(function(schema) {
                    return {
                        id: schema.get("id"),
                        name: schema.get("name"),
                        isCurrent: this.schema.get('id') === schema.get('id')
                    };
                }, this)
            };
        },

        postRender: function() {
            this._super('postRender');
            chorus.menu(this.$(".context a"), {
                content: this.$(".schema_menu_container").html(),
                contentEvents: {
                    'a.schema': _.bind(this.schemaSelected, this)
                }
            });
        },

        setSchema: function(schema) {
            this.resource = this.collection = this.functions = schema.functions();
            this.bindings.add(this.resource, "change reset add remove", this.render);
            this.functions.fetch();
            this.schema = schema;
            this.render();
        },

        schemaSelected: function(e) {
            var schemaId = $(e.target).data("id")
            var schema = this.schemas.get(schemaId)
            this.setSchema(schema);
        },

        contextClicked: function(e) {
            e.preventDefault();
        }
    });
})(jQuery, chorus);
