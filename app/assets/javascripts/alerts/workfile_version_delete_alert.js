chorus.alerts.WorkfileVersionDelete = chorus.alerts.ModelDelete.extend({
    constructorName: "WorkfileVersionDelete",

    text: t("workfile_version.alert.delete.text"),
    ok: t("workfile_version.alert.delete.ok"),
    deleteMessage: "workfile_version.alert.delete.success",

    makeModel: function() {
        this._super('makeModel', arguments);
        this.model = new chorus.models.WorkfileVersion(this.model.attributes);
        this.model.attributes.versionInfo = _.clone(this.model.attributes.versionInfo);
        this.model.get("versionInfo").versionNum = this.options.versionNumber;
        this.model.get("versionInfo").id = this.options.versionId;
    },

    setup: function() {
        this.title = t("workfile_version.alert.delete.title", {version: this.model.get("versionInfo").versionNum});
    }
});