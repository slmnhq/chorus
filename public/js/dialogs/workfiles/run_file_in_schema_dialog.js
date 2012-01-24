(function($, ns) {
    ns.RunFileInSchema = chorus.dialogs.Base.extend({
        className : "run_file_in_schema",
        title : t("workfile.run_in_schema.title"),

        persistent: true,

        events : {
            "click input#sandbox_schema": "sandboxSchemaSelected",
            "click input#another_schema": "otherSchemaSelected"
        },

        subviews: {
            ".schema_picker"   : "schemaPicker"
        },

        setup : function() {
            this.sandbox = this.model.sandbox();
            this.sandbox.bind("loaded", this.sandboxLoaded, this);
            this.sandbox.fetch();

            this.schemaPicker = new chorus.views.SchemaPicker();
        },

        sandboxLoaded : function() {
            this.$(".name").text(this.sandbox.canonicalName());
        },

        postRender : function() {
            this.$(".loading").startLoading();
        },

        sandboxSchemaSelected: function() {
            this.$(".another_schema").addClass("collapsed");
        },

        otherSchemaSelected: function() {
            this.$(".another_schema").removeClass("collapsed");
        }
    });
})(jQuery, chorus.dialogs);
