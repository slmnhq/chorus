chorus.dialogs.DatasetImport = chorus.dialogs.Base.extend({
    className: "dataset_import",
    title: t("dataset.import.title"),

    events : {
        "change input:radio": "onRadioSelect"
    },

    onRadioSelect: function(e) {
        this.$(".new_table input:text").attr("disabled", "disabled");
        this.$(".existing_table select").attr("disabled", "disabled");

        var target = $(e.currentTarget).val();
        if (target == "new") {
            this.$(".new_table input:text").attr("disabled", false);

        } else if (target == "existing") {
            this.$(".existing_table select").attr("disabled", false);
        }

        chorus.styleSelect(self.$("select"));
    },

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
            self.$(".new_table input[type='text']").val(basename);

            self.$("img").removeClass("hidden");
            self.$("img").attr("src", chorus.urlHelpers.fileIconUrl(extension, "medium"));

            self.$(".import_controls").removeClass("hidden");

            self.$(".file-wrapper a").removeClass("hidden");
            self.$(".file-wrapper button").addClass("hidden");

            chorus.styleSelect(self.$("select"));
        }

        function uploadFinished(e, data) {
        }
    }
});
