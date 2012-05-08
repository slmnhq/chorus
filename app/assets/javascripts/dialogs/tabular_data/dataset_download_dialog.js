chorus.dialogs.DatasetDownload = chorus.dialogs.Base.extend({
    constructorName: "DatasetDownload",
    templateName: "dataset_download",
    title: t("dataset.download.title"),

    events: {
        "click button.submit": "submitDownload"
    },

    setup: function() {
        this._super("setup", arguments);
        this.tabular_data = this.options.pageModel;
        this.model = this.resource = new chorus.models.TabularDataDownloadConfiguration();
    },

    submitDownload: function(e) {
        e.preventDefault();

        if (this.$("input[type=radio][id=specify_rows]").prop("checked")) {
            var rows = this.$("input[name=numOfRows]").val();
            this.model.set({ numOfRows: rows }, { silent: true })
            if(this.model.performValidation()) {
                this.tabular_data.download({ rows: rows });
                this.closeModal();
            } else {
                this.showErrors();
            }
        } else {
            this.tabular_data.download();
            this.closeModal();
        }
    }
});

