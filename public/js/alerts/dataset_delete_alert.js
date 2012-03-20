chorus.alerts.DatasetDelete = chorus.alerts.ModelDelete.extend({
    text:t("dataset.delete.text"),
    title:t("dataset.delete.title"),
    ok:t("dataset.delete.button"),
    deleteMessage:"dataset.delete.toast",

    deleteMessageParams:function () {
        return {
            datasetName:this.datasetName
        }
    },

    makeModel:function () {
        this._super("makeModel", arguments);
        this.model = this.model || this.pageModel;
        this.datasetName = this.model.name();
        this.redirectUrl = this.model.workspace().datasetsUrl();
    }
});

