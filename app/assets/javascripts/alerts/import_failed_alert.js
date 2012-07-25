chorus.alerts.ImportFailed = chorus.alerts.Error.extend({
    constructorName: "ImportFailed",

    title: t("import.failed.alert.title"),

    makeModel: function() {
        this.model = new chorus.models.Activity({ id: this.options.activityId });
    },

    setup: function() {
        this.requiredResources.add(this.model);
        this.model.fetch();
    },

    additionalContext: function() {
        return _.extend(this._super("additionalContext"), {
            body: this.model.get("errorMessage")
        });
    }
});
