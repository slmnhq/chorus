chorus.dialogs.DatasetImport = chorus.dialogs.Base.extend({
    className: "dataset_import",
    title: t("dataset.import.title"),

    postRender:function () {
        var self = this;
        this.$("input[type=file]").fileupload({
            change:fileChosen,
            add:fileChosen,
            done:uploadFinished,
            dataType:"text"
        });

        function fileChosen(e, data) {
            self.$("button.submit").attr("disabled", false);
            self.$('.empty_selection').addClass('hidden');

            var filename = data.files[0].name;
            var basename = _.first(filename.split('.'));
            var extension = _.last(filename.split('.'));
            self.$(".file_name").text(filename);
            self.$("img").attr("src", chorus.urlHelpers.fileIconUrl(extension, "medium"));
            self.$(".new_table input[type='text']").val(basename);
            self.$(".import_controls").removeClass("hidden");
        }

        function uploadFinished(e, data) {
        }
    }
});
