;
(function($, ns) {
    ns.views.SqlWorkfileContent = ns.views.Base.extend({
        className : "sql_workfile_content",

        subviews : {
            '.text_content' : 'textContent'
        },

        setup : function() {
            this._super("setup");

            this.textContent = new chorus.views.TextWorkfileContent({ model : this.model })
            this.bind("file:runCurrent", this.runCurrent, this);
//            this.resultConsole = new ns.views.ResultConsole({
//                collection : this.collection,
//                headingText : t("workfile.content_details.activity"),
//                displayStyle : ['without_object', 'without_workspace']
//            });
        },

        runCurrent : function() {
            this.task = new ns.models.Task({
                sql: this.textContent.editor.getValue(),
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
