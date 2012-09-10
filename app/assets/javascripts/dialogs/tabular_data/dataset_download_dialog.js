chorus.dialogs.DatasetDownload = chorus.dialogs.Base.extend({
    constructorName: "DatasetDownload",
    templateName: "dataset_download",
    submitText: t("actions.download"),

    events: {
        "click button.submit": "submitDownload"
    },

    setup: function() {
        this._super("setup", arguments);
        this.tabular_data = this.options.pageModel;
        this.model = this.resource = new chorus.models.TabularDataDownloadConfiguration();
        this.setTitle();
    },

    setTitle: function() {
        this.title = t("dataset.download.title", {datasetName: this.tabular_data.name()});
    },

    additionalContext: function() {
        return {
            submitText: this.submitText
        }
    },

    submitDownload: function(e) {
        e.preventDefault();

        if (this.specifyAll()) {
            this.downloadAll();
        } else {
            if(this.validateInput()) {
                this.downloadSome();
            }
        }
    },

    validateInput: function() {
        this.model.set({ numOfRows: this.numOfRows() }, { silent: true });
        if (this.model.performValidation()) {
            return true
        }
        this.showErrors();
    },

    downloadAll: function() {
        this.tabular_data.download();
        this.closeModal();
    },

    downloadSome: function() {
        this.tabular_data.download({ rows: this.numOfRows() });
        this.closeModal();
    },

    numOfRows: function() {
        return this.$("input[name=numOfRows]").val();
    },

    specifyAll: function() {
        return !this.$("input[type=radio][id=specify_rows]").prop("checked");
    }
});

