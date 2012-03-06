chorus.alerts.ImportFailed = chorus.alerts.Error.extend({
    title: t("import.failed.alert.title"),

    makeModel: function() {
        var id = this.options.launchElement.data("id")
        var workspaceId = this.options.launchElement.data("workspace-id")
        var importType = this.options.launchElement.data("import-type")

        this.model = new chorus.models.DatasetImport({ workspaceId: workspaceId, datasetId: id });
        if (importType){
            this.model.urlParams = {"importType" : importType};
        }

    },

    setup: function() {
        this.requiredResources.add(this.model);
        this.model.fetch();
    },

    additionalContext: function() {
        return _.extend(this._super("additionalContext"),
            {
                body: this.model.get("executionInfo") && this.model.get("executionInfo").result
            }
        )
    }
});