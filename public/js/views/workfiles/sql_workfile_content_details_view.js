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
                    ".run_sandbox": _.bind(this.runInSandbox, this),
                    ".run_other_schema": _.bind(this.runOtherSchema, this)
                }
            });
        },

        setup: function() {
            this._super("setup", arguments);
            this.sandbox = this.model.sandbox();
            this.sandbox.bind("change", this.render, this);
            this.sandbox.fetch();
        },

        additionalContext: function() {
            return {
                sandboxLoaded: this.sandbox.loaded
            }
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
            }, this);
        }
    });
})(jQuery, chorus);
