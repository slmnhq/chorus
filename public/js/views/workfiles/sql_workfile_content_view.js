chorus.views.SqlWorkfileContent = chorus.views.Base.extend({
    className: "sql_workfile_content",

    subviews: {
        '.text_content': 'textContent',
        '.results_console': 'resultsConsole'
    },

    hotkeys: {
        'r': 'file:runCurrent'
    },

    setup: function() {
        this._super("setup");

        this.task = new chorus.models.SqlExecutionTask({ });

        this.task.bind("saved", this.executionSucceeded, this);
        this.task.bind("saveFailed", this.executionFailed, this);

        this.textContent = new chorus.views.TextWorkfileContent({ model: this.model })
        this.resultsConsole = new chorus.views.ResultsConsole({ model: this.task });
        chorus.PageEvents.subscribe("file:runCurrent", this.runInDefault, this);
        chorus.PageEvents.subscribe("file:runInSchema", this.runInSchema, this);
    },

    runInSchema: function(options) {
        this.run(options);
    },

    runInDefault: function() {
        this.run({
            instance: this.model.executionSchema().get('instanceId'),
            database: this.model.executionSchema().get('databaseId'),
            schema: this.model.executionSchema().get('id')
        })
    },

    run: function(options) {
        if (!this.executing) {
            this.executing = true;

            this.task.clear({ silent: true });
            this.task.set({
                taskType: "workfileSQLExecution",
                sql: this.textContent.editor.getValue(),
                entityId: this.model.get("id"),
                schemaId: options.schema,
                instanceId: options.instance,
                databaseId: options.database,
                checkId: (new Date().getTime().toString())
            }, { silent: true })

            this.task.save({}, { method: "create" });
            chorus.PageEvents.broadcast("file:executionStarted", this.task);
        }

    },

    executionSucceeded: function(task) {
        this.executing = false;
        chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
    },

    executionFailed: function(task, response) {
        this.executing = false;
        chorus.PageEvents.broadcast("file:executionFailed", this.task, response);
    }
});
