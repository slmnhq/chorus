chorus.dialogs.InsightsNew = chorus.dialogs.MemoNew.extend({
    title:t("insight.new_dialog.title"),
    placeholder: t("insight.placeholder"),
    submitButton: t("insight.button.create"),

    makeModel:function () {
        this.model = new chorus.models.Insight({
            entityType:this.options.launchElement.data("entity-type"),
            entityId:this.options.launchElement.data("entity-id"),
            workspaceId: this.options.launchElement.data("workspace-id")
        });
        this._super("makeModel", arguments);
    }
});