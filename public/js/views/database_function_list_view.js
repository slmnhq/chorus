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
                schemaLink: ns.helpers.linkTo("#", this.schema.get('name'))
            };
        },

        schemaMenuContent: function() {
            var content = $("<ul></ul>");
            this.schemas.each(function(schema) {
                var a = "<a href='#' class='schema' data-id='" + schema.get("id") + "'>" + schema.get("name") + "</a>"
                var li = $("<li></li>").html(a);
                content.append(li);
            });
            return content.outerHtml()
        },

        postRender: function() {
            chorus.search({
                input: this.$('input.search'),
                list: this.$('ul')
            });

            chorus.menu(this.$(".context a"), {
                content: this.schemaMenuContent(),
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
