chorus.dialogs.RunAndDownload = chorus.dialogs.DatasetDownload.extend({
    constructorName: "RunAndDownload",
    submitText: t("workfile.run_and_download_dialog.run"),

    persistent:true,

    setTitle: function() {
        this.title = t("workfile.run_and_download_dialog.title");
    },

    downloadAll: function() {
        chorus.PageEvents.broadcast("file:runAndDownload");
        this.closeModal();
    },

    downloadSome: function() {
        chorus.PageEvents.broadcast("file:runAndDownload", this.numOfRows());
        this.closeModal();
    }
});