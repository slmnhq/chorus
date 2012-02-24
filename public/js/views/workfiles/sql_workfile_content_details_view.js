chorus.views.SqlWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    className: "sql_workfile_content_details",

    setup: function() {
        chorus.PageEvents.subscribe("workfile:executed", this.workfileExecuted, this);
    },

    postRender: function() {
        this._super("postRender")
        var self = this;
        chorus.menu(this.$('.run_file'), {
            content: this.$(".run_workfile").html(),
            orientation: "right",
            contentEvents: {
                "a.run_default": _.bind(this.runInExecutionSchema, this),
                ".run_other_schema": _.bind(this.runOtherSchema, this)
            }
        });
    },

    additionalContext: function() {
        var ctx = this._super("additionalContext");

        var executionSchema = this.model.executionSchema();
        var sandboxSchema = this.model.sandbox() && this.model.sandbox().schema()
        return _.extend(ctx, {
            schemaName: executionSchema && executionSchema.canonicalName(),
            executionSchemaIsSandbox: (executionSchema && sandboxSchema && executionSchema.isEqual(sandboxSchema))
        });
    },

    runInExecutionSchema: function() {
        chorus.PageEvents.broadcast("file:runCurrent");
    },

    runOtherSchema: function() {
        this.dialog = new chorus.dialogs.RunFileInSchema({model: this.model});
        this.dialog.launchModal();
    },

    workfileExecuted: function(workfile, executionInfo) {
        this.model.set({executionInfo: executionInfo}, {silent: true});
        this.render();
    }
});

