chorus.views.SqlWorkfileContent = chorus.views.Base.extend({
    templateName: "sql_workfile_content",

    subviews: {
        '.text_content': 'textContent',
        '.results_console': 'resultsConsole'
    },

    hotkeys: {
        'r': 'file:runCurrent',
        'e': 'file:runSelected'
    },

    setup: function() {
        this._super("setup");

        this.task = new chorus.models.SqlExecutionTask({ });

        this.bindings.add(this.task, "saved", this.executionSucceeded);
        this.bindings.add(this.task, "saveFailed", this.executionFailed);

        this.textContent = new chorus.views.TextWorkfileContent({ model: this.model, hotkeys: this.hotkeys })
        this.resultsConsole = new chorus.views.ResultsConsole({ model: this.task });
        chorus.PageEvents.subscribe("file:runCurrent", this.runInDefault, this);
        chorus.PageEvents.subscribe("file:runSelected", this.runSelected, this);
        chorus.PageEvents.subscribe("file:runInSchema", this.runInSchema, this);
    },

    runInSchema: function(options) {
        this.run(options);
    },

    runSelected: function() {
        var selectedText = this.getSelectedText();
        if (selectedText) {
            var runOptions = {selection: selectedText};
            var schema = this.model.executionSchema();
            if(schema){
                runOptions.instance = schema.get("instance_id");
                runOptions.database = schema.get("databaseId");
                runOptions.schema = schema.get("id");
            }

            this.run(runOptions);
        }
    },

    runInDefault: function() {
        if (!this.model.executionSchema()) return;
        this.run({
            instance: this.model.executionSchema().get('instance_id'),
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
                sql: options && options.selection ? options.selection : this.textContent.editor.getValue(),
                entityId: this.model.get("id"),
                schemaId: options.schema,
                instance_id: options.instance,
                databaseId: options.database,
                checkId: (new Date().getTime().toString())
            }, { silent: true });

            this.task.save({}, { method: "create" });
            chorus.PageEvents.broadcast("file:executionStarted", this.task);
        }
    },

    getSelectedText: function() {
        return this.textContent.editor.getSelection();
    },

    executionSucceeded: function(task) {
        this.executing = false;
        chorus.PageEvents.broadcast("file:executionSucceeded", task);
        chorus.PageEvents.broadcast("workfile:executed", this.model, task.get("executionInfo"))
    },

    executionFailed: function(task, data) {
        this.executing = false;
        chorus.PageEvents.broadcast("file:executionFailed", task, data);
        var executionInfo = data.response && data.response.executionInfo;
        if (executionInfo) {
            chorus.PageEvents.broadcast("workfile:executed", this.model, executionInfo);
        }
    }
});
