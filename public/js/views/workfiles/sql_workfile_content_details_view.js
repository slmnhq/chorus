(function($, ns) {
    ns.views.SqlWorkfileContentDetails = ns.views.WorkfileContentDetails.extend({
        className : "sql_workfile_content_details",
        postRender: function() {
            this._super("postRender")
            var self = this;
            chorus.menu(this.$('.run_file'), {
                content: this.$(".run_workfile").html(),
                orientation: "right",
                contentEvents: {
                    "a.run_default": _.bind(this.runInSandbox, this),
                    ".run_other_schema": _.bind(this.runOtherSchema, this)
                }
            });
        },

        additionalContext : function() {
            var defaultSchema = this.model.defaultSchema();
            var sandboxSchema = this.model.sandbox() && this.model.sandbox().schema()
            return {
                schemaName : defaultSchema && defaultSchema.canonicalName(),
                defaultSchemaIsSandbox : (defaultSchema && defaultSchema.isEqual(sandboxSchema))
            };
        },

        runInSandbox: function() {
            this.trigger("file:runCurrent");
        },

        runOtherSchema: function() {
            this.dialog = new chorus.dialogs.RunFileInSchema({model: this.model});
            this.dialog.launchModal();

            this.dialog.bind("run", function() {
                var args = _.toArray(arguments);
                args.unshift("file:runInSchema");
                this.trigger.apply(this, args);

                this.model.fetch();
            }, this);
        }
    });
})(jQuery, chorus);
