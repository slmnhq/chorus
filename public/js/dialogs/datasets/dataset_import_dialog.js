chorus.dialogs.DatasetImport = chorus.dialogs.Base.extend({
    className: "dataset_import",
    title: t("dataset.import.title"),

    events: {
        "change input:radio": "onRadioSelect",
        "submit form": "uploadFile"
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

    additionalContext : function() {
        return {
            canonicalName : this.options.launchElement.data("canonicalName")
        }
    },

    uploadFile: function(e) {
        e && e.preventDefault();
        this.$("button.submit").startLoading("actions.uploading");
        this.uploadObj.url = "/edc/workspace/" + this.options.launchElement.data("workspaceId") + "/csv/sample"
        this.request = this.uploadObj.submit();
    },

    modalClosed : function() {
        if (this.request) {
            this.request.abort();
        }

        this._super("modalClosed");
    },

    postRender: function() {
        var self = this;
        this.$("input[type=file]").fileupload({
            change: fileChosen,
            add: fileChosen,
            done: uploadFinished,
            dataType: "json"
        });

        function fileChosen(e, data) {
            self.$("button.submit").attr("disabled", false);
            self.$('.empty_selection').addClass('hidden');

            self.uploadObj = data;
            var filename = data.files[0].name;
            var filenameComponents = filename.split('.');
            var basename = _.first(filenameComponents);
            var extension = _.last(filenameComponents);
            self.$(".file_name").text(filename);
            self.$(".new_table input[type='text']").val(basename.toLowerCase().replace(/ /g, '_'));

            self.$("img").removeClass("hidden");
            self.$("img").attr("src", chorus.urlHelpers.fileIconUrl(extension, "medium"));

            self.$(".import_controls").removeClass("hidden");

            self.$(".file-wrapper a").removeClass("hidden");
            self.$(".file-wrapper button").addClass("hidden");

            chorus.styleSelect(self.$("select"));
        }

        function uploadFinished(e, data) {
            e && e.preventDefault();
            self.$("button.submit").stopLoading();
            self.csv = new chorus.models.CSVImport({
                workspaceId: self.options.launchElement.data("workspaceId"),
                toTable: chorus.models.CSVImport.normalizeForDatabase(self.$(".new_table input[type='text']").val()),
                include_header: true
            });
            self.csv.set(self.csv.parse(data.result));
            var dialog = new chorus.dialogs.TableImportCSV({csv: self.csv});
            dialog.launchModal();
        }
    }
});
