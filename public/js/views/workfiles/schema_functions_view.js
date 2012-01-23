(function($, ns) {
    ns.views.SchemaFunctions = ns.views.Base.extend({
        className : "schema_functions",
        useLoadingSection: true,

        setup: function() {
            this.sandbox = this.options.sandbox;
            this.schema = this.sandbox.schema();
            this.resource = this.collection = this.functions = this.schema.functions();
            this.bindings.add(this.resource, "change reset add remove", this.render);
            this.functions.fetch();
        },

        additionalContext: function() {
            return {
                schemaName: this.sandbox.get('schemaName')
            };
        },

        postRender: function() {
            chorus.search({
                input: this.$('input.search'),
                list: this.$('ul')
            });
            this.$('.functions li').hover(_.bind(this.showInsert, this), _.bind(this.hideInsert, this))

        },

        showInsert: function(e) {
            $(e.target).find('.insert_hover').removeClass('hidden')
        },

        hideInsert: function() {
            this.$('.insert_hover').addClass('hidden');
        }

    });
})(jQuery, chorus);
