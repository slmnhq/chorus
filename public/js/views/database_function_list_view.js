(function($, ns) {
    ns.views.DatabaseFunctionList = ns.views.Base.extend({
        className : "database_function_list",
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
        }

    });
})(jQuery, chorus);
