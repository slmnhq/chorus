chorus.dialogs.DatasetDownload = chorus.dialogs.Base.extend({
    constructorName: "DatasetDownload",
    templateName: "dataset_download",

    events: {
        "click button.submit": "submitDownload"
    },

    setup: function() {
        this._super("setup", arguments);
        this.dataset = this.options.pageModel;
        this.model = this.resource = new chorus.models.DatasetDownloadConfiguration();
        this.title = t("dataset.download.title", {datasetName: this.dataset.name()});
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
        this.dataset.download();
        this.closeModal();
    },

    downloadSome: function() {
        this.model.set({ numOfRows: this.numOfRows() }, { silent: true });

        if (this.model.performValidation()) {
            this.dataset.download({ rows: this.numOfRows() });
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

