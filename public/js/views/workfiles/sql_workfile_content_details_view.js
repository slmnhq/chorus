chorus.views.SqlWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    className:"sql_workfile_content_details",

    setup:function () {
        this.bind("file:executionCompleted", this.executionCompleted, this);
    },

    postRender:function () {
        this._super("postRender")
        var self = this;
        chorus.menu(this.$('.run_file'), {
            content:this.$(".run_workfile").html(),
            orientation:"right",
            contentEvents:{
                "a.run_default":_.bind(this.runInExecutionSchema, this),
                ".run_other_schema":_.bind(this.runOtherSchema, this)
            }
        });
    },

    additionalContext:function () {
        var executionSchema = this.model.executionSchema();
        var sandboxSchema = this.model.sandbox() && this.model.sandbox().schema()
        return {
            schemaName:executionSchema && executionSchema.canonicalName(),
            executionSchemaIsSandbox:(executionSchema && executionSchema.isEqual(sandboxSchema))
        };
    },

    runInExecutionSchema:function () {
        this.trigger("file:runCurrent");
    },

    runOtherSchema:function () {
        this.dialog = new chorus.dialogs.RunFileInSchema({model:this.model});
        this.dialog.launchModal();

        this.dialog.bind("run", function () {
            var args = _.toArray(arguments);
            args.unshift("file:runInSchema");
            this.trigger.apply(this, args);
        }, this);
    },

    executionCompleted:function (task) {
        this.model.set({executionInfo:task.get("executionInfo")}, {silent:true});
        this.render();
    }
});

