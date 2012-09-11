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

        this.textContent = new chorus.views.TextWorkfileContent({ model: this.model, hotkeys: this.hotkeys })
        this.resultsConsole = new chorus.views.ResultsConsole({
            enableResize: true,
            enableExpander: true
        });
        chorus.PageEvents.subscribe("file:runCurrent", this.runInDefault, this);
        chorus.PageEvents.subscribe("file:runSelected", this.runSelected, this);
        chorus.PageEvents.subscribe("file:runInSchema", this.runInSchema, this);
        chorus.PageEvents.subscribe("file:newChorusView", this.newChorusView, this);
        chorus.PageEvents.subscribe("file:newSelectionChorusView", this.newSelectionChorusView, this);
        chorus.PageEvents.subscribe("file:runAndDownload", this.runAndDownload, this);
    },

    runInSchema: function(options) {
        this.run(options);
    },

    runSelected: function() {
        var runOptions = {selection: true};
        var schema = this.model.executionSchema();
        if(schema){
            runOptions.schemaId = schema.get("id");
        }

        this.run(runOptions);
    },

    runInDefault: function(options) {
        options = options || {};
        if (!this.model.executionSchema()) return;
        this.run(_.extend(options, {
            schemaId: this.model.executionSchema().get('id')
        }));
    },

    runAndDownload: function(options) {
        this.runInDefault(_.extend({taskClass: chorus.models.SqlExecutionAndDownloadTask}, options));
    },

    run: function(options) {
        options = options || {};
        if (this.executing) {
            return;
        }
        if(options.selection) {
            options.selection = this.getSelectedText();
        }

        this.createTask(options.taskClass || chorus.models.WorkfileExecutionTask);

        this.executing = true;
        this.task.set({
            sql: options && options.selection ? options.selection : this.textContent.editor.getValue(),
            workfile: this.model,
            schemaId: options.schemaId,
            checkId: (new Date().getTime().toString()),
            numOfRows: options.numOfRows
        }, { silent: true });

        this.task.save({}, { method: "create" });
        chorus.PageEvents.broadcast("file:executionStarted", this.task);
    },

    createTask: function(taskClass) {
        this.task = new taskClass({ });
        this.bindings.remove(undefined, 'saved', this.executionSucceeded);
        this.bindings.remove(undefined, 'saveFailed', this.executionFailed);
        this.bindings.add(this.task, "saved", this.executionSucceeded);
        this.bindings.add(this.task, "saveFailed", this.executionFailed);
        this.resultsConsole.model = this.task;
    },

    newChorusView: function() {
        return this.newChorusViewWithContent(this.textContent.editor.getValue());
    },

    newSelectionChorusView: function() {
        return this.newChorusViewWithContent(this.getSelectedText());
    },

    newChorusViewWithContent: function(content) {
        var executionSchema = this.model.executionSchema();

        this.chorusView = new chorus.models.ChorusView({
            sourceObjectId: this.model.id,
            sourceObjectType: "workfile",
            schemaId: executionSchema.id,
            query: content
        });
        this.chorusView.sourceObject = this.model;

        var dialog = new chorus.dialogs.VerifyChorusView({model: this.chorusView});
        dialog.launchModal();
    },

    getSelectedText: function() {
        return this.textContent.editor.getSelection();
    },

    executionSucceeded: function(task) {
        this.executing = false;
        chorus.PageEvents.broadcast("file:executionSucceeded", task);
        chorus.PageEvents.broadcast("workfile:executed", this.model, task.executionSchema())
    },

    executionFailed: function(task) {
        this.executing = false;
        chorus.PageEvents.broadcast("file:executionFailed", task);
        var executionInfo = task.errorData && task.errorData.executionInfo;
        if (executionInfo) {
            chorus.PageEvents.broadcast("workfile:executed", this.model, executionInfo);
        }
    }
});
