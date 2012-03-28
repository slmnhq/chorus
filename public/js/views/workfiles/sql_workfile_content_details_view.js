chorus.views.SqlWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    className: "sql_workfile_content_details",

    setup: function() {
        chorus.PageEvents.subscribe("workfile:executed", this.workfileExecuted, this);
        this.contentView = this.options.contentView;
    },

    postRender: function() {
        this._super("postRender");
        chorus.menu(this.$('.run_file'), {
            content: this.$(".run_workfile"),
            orientation: "right",
            qtipArgs: {
                events: {
                    show: _.bind(function(e) {
                        $(".run_workfile .run_selection").toggleClass("disabled", !this.enableRunSelection());
                    }, this)
                }
            },
            contentEvents: {
                "a.run_default": _.bind(this.runInExecutionSchema, this),
                "a.run_selection": _.bind(this.runSelectedInExecutionSchema, this),
                "a.run_other_schema": _.bind(this.runOtherSchema, this)
            }
        });

        if (!this.model.workspace().isActive()) {
            this.$(".run_file").attr("disabled", "disabled");
        }
    },

    enableRunSelection: function() {
        return !!(this.contentView.getSelectedText() && this.model.executionSchema());
    },

    getContentSelection: function() {
        return this.contentView.getSelectedText();
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

    runSelectedInExecutionSchema: function() {
        if(this.enableRunSelection()) {
        chorus.PageEvents.broadcast("file:runSelected");
        }
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

