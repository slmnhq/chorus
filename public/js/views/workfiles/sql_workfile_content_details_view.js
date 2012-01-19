(function($, ns) {
    ns.views.SqlWorkfileContentDetails = ns.views.WorkfileContentDetails.extend({
        className : "sql_workfile_content_details",
        postRender: function() {
            this._super("postRender")
            var self = this;
            chorus.menu(this.$('.run_file'), {
                content: this.$(".run_workfile").html(),
                contentEvents: {
                    ".run_sandbox": _.bind(this.runInSandbox, this)
                }
            });
        },

        setup: function() {
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
        }
    });
})(jQuery, chorus);
