chorus.alerts.DatasetDelete = chorus.alerts.ModelDelete.extend({
    constructorName: "DatasetDelete",

    setup: function() {
        this._super("setup")

        var keyPrefix = this.options.launchElement.data("key-prefix");
        this.text = t("dataset." + keyPrefix + ".text");
        this.title = t("dataset." + keyPrefix + ".title");
        this.ok = t("dataset." + keyPrefix + ".button");
        this.deleteMessage = "dataset." + keyPrefix + ".toast";
    },

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

