chorus.alerts.ImportFailed = chorus.alerts.Error.extend({
    title: t("import.failed.alert.title"),

    makeModel: function() {
        var taskId = this.options.launchElement.data("task-id");
        this.model = new chorus.models.TaskReport({ id: taskId });
    },

    setup: function() {
        this.requiredResources.add(this.model);
        this.model.fetch();
    },

    additionalContext: function() {
        return _.extend(this._super("additionalContext"), {
            body: this.model.get("result")
        });
    }
});