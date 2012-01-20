(function($, ns) {
    ns.views.SchemaFunctions = ns.views.Base.extend({
        className : "schema_functions",
        useLoadingSection: true,

        setup: function(sandbox) {
            this.sandbox = sandbox;
            this.schema = this.sandbox.schema();
            this.resource = this.collection = this.functions = this.schema.functions();
            this.bindings.add(this.resource, "change reset add remove", this.render);
            this.functions.fetch();
        }

    });
})(jQuery, chorus);
