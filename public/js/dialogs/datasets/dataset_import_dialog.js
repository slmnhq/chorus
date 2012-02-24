chorus.dialogs.DatasetImport = chorus.dialogs.Base.extend({
    className: "dataset_import",
    title: t("dataset.import.title"),

    events: {
        "change input:radio": "onRadioSelect",
        "submit form": "uploadFile"
    },

    setup: function() {
        var workspaceId = this.options.launchElement.data("workspace-id");
        this.sandboxTables = new chorus.collections.DatasetSet([], {workspaceId: workspaceId, type: "SANDBOX_TABLE"});
        this.sandboxTables.fetchAll();
    },

    onRadioSelect: function(e) {
        this.$(".new_table input:text").attr("disabled", "disabled");
        this.$(".existing_table select").attr("disabled", "disabled");
        this.$(".existing_table .options").addClass('hidden');
        this.$(".existing_table .options input").attr("disabled", "disabled");

        var target = $(e.currentTarget).val();

        if (target == "new") {
            this.$(".new_table input:text").attr("disabled", false);

        } else if (target == "existing") {
            this.$(".existing_table select").attr("disabled", false);
            this.$(".existing_table .options").removeClass("hidden");
            this.$(".existing_table .options input").attr("disabled", false);
        }
        chorus.styleSelect(this.$("select"));
    },

    onSandboxListLoaded: function() {
        this.$(".existing_table .spinner").stopLoading();

        var select = this.$(".existing_table select");
        select.append($("<option/>").prop('value', '').text(t("selectbox.select_one")));

        this.sandboxTables.each(function(model) {
            select.append($("<option/>").prop('value', model.get("objectName")).text(model.get("objectName")));
        });

        this.$(".existing_table .select").removeClass("hidden");

        chorus.styleSelect(self.$("select"));
    },

    additionalContext: function() {
        return {
            canonicalName: this.options.launchElement.data("canonicalName")
        }
    },

    makeModel: function() {
        this.resource = this.model = this.csv = new chorus.models.CSVImport({
            workspaceId: this.options.launchElement.data("workspaceId"),
            include_header: true
        });
    },

    uploadFile: function(e) {
        e && e.preventDefault();

        var toTable = this.$('.new_table input:text').is(':disabled') ? this.$(".existing_table select").val() : chorus.models.CSVImport.normalizeForDatabase(this.$(".new_table input[type='text']").val())
        this.csv.set({
            toTable: toTable,
            truncate: this.$(".existing_table input#truncate").is(':checked')
        })

        this.$("button.submit").startLoading("actions.uploading");
        this.uploadObj.url = "/edc/workspace/" + this.options.launchElement.data("workspaceId") + "/csv/sample"
        this.request = this.uploadObj.submit();
    },

    modalClosed: function() {
        if (this.request) {
            this.request.abort();
        }

        this._super("modalClosed");
    },

    postRender: function() {
        var self = this;

        self.$(".existing_table .spinner").startLoading();
        this.sandboxTables.onLoaded(this.onSandboxListLoaded, this);


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

        }

        function uploadFinished(e, data) {
            e && e.preventDefault();
            self.$("button.submit").stopLoading();

            self.csv.set(self.csv.parse(data.result));
            if (self.csv.serverErrors) {
                self.csv.trigger("saveFailed");
                fileChosen(e, data);
            }
            else {
                var dialog = new chorus.dialogs.TableImportCSV({csv: self.csv});
                dialog.launchModal();
            }
        }
    }
});
