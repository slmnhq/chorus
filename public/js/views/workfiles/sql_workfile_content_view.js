chorus.views.SqlWorkfileContent = chorus.views.Base.extend({
    className:"sql_workfile_content",

    subviews:{
        '.text_content':'textContent',
        '.results_console':'resultsConsole'
    },

    hotkeys:{
        'r':'file:runCurrent'
    },

    setup:function () {
        this._super("setup");

        this.task = new chorus.models.SqlExecutionTask({ });

        this.task.bind("saved", this.executionComplete, this);

        this.textContent = new chorus.views.TextWorkfileContent({ model:this.model })
        this.resultsConsole = new chorus.views.ResultsConsole({ model:this.task });
        this.bind("file:runCurrent", this.runInDefault, this);
        this.bind("file:runInSchema", this.runInSchema, this);

        this.forwardEvent("file:executionStarted", this.resultsConsole);
        this.forwardEvent("file:executionCompleted", this.resultsConsole);
        this.forwardEvent("file:saveCurrent", this.textContent);
        this.forwardEvent("file:createWorkfileNewVersion", this.textContent);
        this.forwardEvent("file:insertText", this.textContent);
    },

    runInSchema:function (options) {
        this.run(options);
    },

    runInDefault:function () {
        this.run({
            instance:this.model.executionSchema().get('instanceId'),
            database:this.model.executionSchema().get('databaseId'),
            schema:this.model.executionSchema().get('id')
        })
    },

    run:function (options) {
        if (!this.executing) {
            this.executing = true;

            this.task.clear({ silent:true });
            this.task.set({
                taskType:"workfileSQLExecution",
                sql:this.textContent.editor.getValue(),
                entityId:this.model.get("id"),
                schemaId:options.schema,
                instanceId:options.instance,
                databaseId:options.database,
                checkId:(new Date().getTime().toString())
            }, { silent:true })

            this.task.save({}, { method:"create" });
            this.trigger("file:executionStarted", this.task);
        }

    },

    executionComplete:function (task) {
        this.executing = false;
        this.trigger("file:executionCompleted", this.task);
    }
});
