chorus.models.SqlExecutionAndDownloadTask = chorus.models.WorkfileExecutionTask.extend({
    constructorName: "SqlExecutionAndDownloadTask",

    save: function() {
        $.fileDownload('/edc/task/sync/downloadResult', {
            data: _.extend({}, this.attributes),
            httpMethod: "post",
            successCallback: _.bind(this.saved, this),
            failCallback: _.bind(this.saveFailed, this),
            cookieName: 'fileDownload_' + this.get('checkId')
        });

        this.set({
            executionInfo: {
                instanceId: this.get("instanceId"),
                databaseId: this.get("databaseId"),
                schemaId: this.get("schemaId")
            },
            result: {
                hasResult: "false"
            }
        }, { silent: true });
    },

    saved: function() {
        this.trigger("saved", this);
    },

    saveFailed: function() {
        this.trigger("saveFailed");
    },

    cancel: function() {
        this._super("cancel");
        chorus.PageEvents.broadcast("file:executionCancelled");
    }
});
