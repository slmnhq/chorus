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

        this.bindings.add(this.task, "saved", this.executionSucceeded);
        this.bindings.add(this.task, "saveFailed", this.executionFailed);

        this.textContent = new chorus.views.TextWorkfileContent({ model: this.model })
        this.resultsConsole = new chorus.views.ResultsConsole({ model: this.task });
        chorus.PageEvents.subscribe("file:runCurrent", this.runInDefault, this);
        chorus.PageEvents.subscribe("file:runInSchema", this.runInSchema, this);
    },

    runInSchema: function(options) {
        this.run(options);
    },

    runInDefault: function() {
        if (!this.model.executionSchema()) return;
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
        chorus.PageEvents.broadcast("file:executionSucceeded", task);
        chorus.PageEvents.broadcast("workfile:executed", this.model, task.get("executionInfo"))
    },

    executionFailed: function(task, response) {
        this.executing = false;
        chorus.PageEvents.broadcast("file:executionFailed", task, response);
        if(response.resource[0] && response.resource[0].executionInfo) {
            chorus.PageEvents.broadcast("workfile:executed", this.model, response.resource[0].executionInfo);
        }
    }
});
