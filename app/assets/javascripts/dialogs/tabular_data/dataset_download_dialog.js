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

        if (this.specifyAll()) {
            this.downloadAll();
        } else {
            this.downloadSome();
        }
    },

    downloadAll: function() {
        this.tabular_data.download();
        this.closeModal();
    },

    downloadSome: function() {
        this.model.set({ numOfRows: this.numOfRows() }, { silent: true })

        if (this.model.performValidation()) {
            this.tabular_data.download({ rows: this.numOfRows() });
            this.closeModal();
        } else {
            this.showErrors();
        }
    },

    numOfRows: function() {
        return this.$("input[name=numOfRows]").val();
    },

    specifyAll: function() {
        return !this.$("input[type=radio][id=specify_rows]").prop("checked");
    }
});

