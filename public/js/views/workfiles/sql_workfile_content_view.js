;
(function($, ns) {
    ns.views.SqlWorkfileContent = ns.views.Base.extend({
        className : "sql_workfile_content",

        subviews : {
            '.text_content' : 'textContent',
            '.results_console' : 'resultsConsole'
        },

        hotkeys : {
            'r' : 'file:runCurrent'
        },

        setup : function() {
            this._super("setup");

            this.task = new ns.models.Task({ });

            this.task.bind("saved", this.executionComplete, this);

            this.textContent = new chorus.views.TextWorkfileContent({ model : this.model })
            this.resultsConsole = new ns.views.ResultsConsole({ model : this.task });
            this.bind("file:runCurrent", this.runCurrent, this);

            this.forwardEvent("file:executionStarted", this.resultsConsole);
            this.forwardEvent("file:executionCompleted", this.resultsConsole);
            this.forwardEvent("file:saveCurrent", this.textContent);
            this.forwardEvent("file:createWorkfileNewVersion", this.textContent);
            this.forwardEvent("file:insertText", this.textContent);
        },

        runCurrent : function() {
            if (!this.executing) {
                this.executing = true;

                this.task.clear({ silent : true });
                this.task.set({
                    taskType: "workfileSQLExecution",
                    sql : this.textContent.editor.getValue(),
                    entityId : this.model.get("id"),
                    schemaId: this.model.sandbox().get('schemaId'),
                    instanceId: this.model.sandbox().get('instanceId'),
                    databaseId: this.model.sandbox().get('databaseId'),
                    checkId: (new Date().getTime().toString())
                }, { silent : true })

                this.task.save({}, { method : "create" });
                this.trigger("file:executionStarted", this.task);
            }
        },

        executionComplete: function(task) {
            this.executing = false;
            this.trigger("file:executionCompleted", this.task);
        }
    });
})(jQuery, chorus);
