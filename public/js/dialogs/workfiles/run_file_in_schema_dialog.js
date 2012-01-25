(function($, ns) {
    ns.RunFileInSchema = chorus.dialogs.Base.extend({
        className : "run_file_in_schema",
        title : t("workfile.run_in_schema.title"),

        persistent: true,

        events : {
            "click button.submit"        : "onClickSubmit",
            "click input#sandbox_schema" : "sandboxSchemaSelected",
            "click input#another_schema" : "anotherSchemaSelected"
        },

        subviews: {
            ".schema_picker" : "schemaPicker"
        },

        setup : function() {
            this.sandbox = this.model.sandbox();
            this.sandbox.bind("loaded", this.sandboxLoaded, this);
            this.sandbox.fetch();

            this.schemaPicker = new chorus.views.SchemaPicker();
            this.schemaPicker.bind("change", this.onSchemaPickerChange, this);
        },

        sandboxLoaded : function() {
            this.$(".name").text(this.sandbox.canonicalName());
        },

        postRender : function() {
            this.$(".loading").startLoading();
        },

        onSchemaPickerChange: function() {
            this.$("button.submit").attr("disabled", !this.schemaPicker.ready());
        },

        onClickSubmit: function() {
            var options = {};
            if (this.$("#sandbox_schema").is(":checked")) {
                options = {
                    instance : this.sandbox.get("instanceId"),
                    database : this.sandbox.get("databaseId"),
                    schema   : this.sandbox.get("schemaId"),
                }
            } else {
                options = this.schemaPicker.fieldValues();
            }

            this.trigger("run", options);
            this.closeModal();
        },

        sandboxSchemaSelected: function() {
            this.$(".another_schema").addClass("collapsed");
            this.$("button.submit").attr("disabled", false);
        },

        anotherSchemaSelected: function() {
            this.$(".another_schema").removeClass("collapsed");
            this.onSchemaPickerChange();
        }
    });
})(jQuery, chorus.dialogs);
