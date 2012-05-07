chorus.dialogs.DatasetDownload = chorus.dialogs.Base.extend({
    constructorName: "DatasetDownload",
    templateName: "dataset_download",
    title: t("dataset.download.title"),

    events: {
        "click button.submit": "submitDownload"
    },

    submitDownload: function(e) {
        e.preventDefault();

        if (this.$("input[type=radio][id=specify_rows]").prop("checked")) {
            this.model.download({ rows: this.$("input[name=rows]").val() });
        } else {
            this.model.download();
        }
    }
});

