;
(function($, ns) {
    ns.views.SqlWorkfileContent = ns.views.TextWorkfileContent.extend({
        className : "sql_workfile_content",

        setup : function() {
            this._super("setup");
            this.bind("file:runCurrent", this.runCurrent, this)
        },

        runCurrent : function() {
            this.task = new ns.models.Task({
                sql: this.editor.getValue(),
                entityId: this.model.get('id'),
                schemaId: this.model.sandbox().get('schemaId'),
                instanceId: this.model.sandbox().get('instanceId'),
                databaseId: this.model.sandbox().get('databaseId')
            });
            this.task.bind("saved", _.bind(function() {
                this.trigger("file:executionCompleted", this.task);
            }, this));
            this.task.save();
        }
    });
})(jQuery, chorus);
