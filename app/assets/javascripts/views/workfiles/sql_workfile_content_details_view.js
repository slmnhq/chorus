chorus.views.SqlWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    templateName: "sql_workfile_content_details",

    setup: function() {
        this._super("setup", arguments);

        chorus.PageEvents.subscribe("workfile:executed", this.workfileExecuted, this);
        chorus.PageEvents.subscribe("file:selectionPresent", this.changeRunFileButtonText, this);
        chorus.PageEvents.subscribe("file:selectionEmpty", this.changeRunSelectedButtonText, this);
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

        if (!this.hasValidExecutionSchema()) {
            this.fileMenu.disableItem("newChorusView");
            this.selectionMenu.disableItem("newSelectionChorusView");
        }
    },

    selectionMenuItems: function() {
        var items = this._super("selectionMenuItems", arguments);
        items.push({
                name: "newSelectionChorusView",
                text: t("workfile.content_details.save_selection_as_chorus_view"),
                onSelect: _.bind(this.createChorusViewFromSelection, this)
            })
        return items;
    },

    fileMenuItems: function() {
        var items = this._super("fileMenuItems", arguments);
        items.push({
            name: "newChorusView",
            text: t("workfile.content_details.save_file_as_chorus_view"),
            onSelect: _.bind(this.createChorusViewFromFile, this)
        })
        return items;
    },

    enableRunSelection: function() {
        return !!(this.contentView.getSelectedText() && this.hasValidExecutionSchema());
    },

    hasValidExecutionSchema: function() {
        return !!(this.model.executionSchema());
    },

    changeRunFileButtonText: function() {
        this.$(".run_file .run_description").text(t("workfile.content_details.run_selected"));
    },

    changeRunSelectedButtonText: function() {
        this.$(".run_file .run_description").text(t("workfile.content_details.run_file"));
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

    createChorusViewFromFile: function() {
        chorus.PageEvents.broadcast("file:newChorusView");
    },

    createChorusViewFromSelection: function() {
        chorus.PageEvents.broadcast("file:newSelectionChorusView");
    },

    runInExecutionSchema: function() {
        chorus.PageEvents.broadcast("file:runCurrent");
    },

    runSelectedInExecutionSchema: function() {
        if (this.enableRunSelection()) {
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

