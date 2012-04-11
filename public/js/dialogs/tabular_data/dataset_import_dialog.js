chorus.dialogs.DatasetImport = chorus.dialogs.Base.extend({
    className: "dataset_import",
    title: t("dataset.import.title"),

    events: {
        "change input:radio": "onRadioSelect",
        "submit form": "uploadFile",
        "click button.submit": "uploadFile",
        "change select": "onSelectChanged"
    },

    setup: function() {
        var workspaceId = this.options.launchElement.data("workspace-id");
        this.sandboxTables = new chorus.collections.DatasetSet([], {workspaceId: workspaceId, type: "SANDBOX_TABLE"});
        this.sandboxTables.bind("loaded", this.filterTables, this);
        this.sandboxTables.fetchAll();
    },

    filterTables: function() {
        this.sandboxTables.models = _.filter(this.sandboxTables.models, _.bind(function(table) {
            return _.include(["BASE_TABLE", "MASTER_TABLE"], table.get("objectType"));
        }, this));
    },

    onRadioSelect: function(e) {
        this.$(".new_table input:text").prop("disabled", true);
        this.$(".existing_table select").prop("disabled", true);
        this.$(".existing_table .options").addClass('hidden');
        this.$(".existing_table .options input").prop("disabled", true);

        this.importTarget = $(e.currentTarget).val();

        if (this.importTarget == "new") {
            this.$(".new_table input:text").prop("disabled", false);
            this.$("button.submit").prop("disabled", false);
        } else if (this.importTarget == "existing") {
            this.$(".existing_table select").prop("disabled", false);
            this.$(".existing_table .options").removeClass("hidden");
            this.$(".existing_table .options input").prop("disabled", false);
            if (!this.$("select").val()) {
                this.$("button.submit").prop("disabled", true);
            }
        } else {
            this.$("button.submit").prop("disabled", false);
        }

        chorus.styleSelect(this.$("select"));
    },

    onSelectChanged: function(e) {
        if ($(e.currentTarget).val()) {
            this.$("button.submit").prop("disabled", false);
        } else {
            this.$("button.submit").prop("disabled", true);
        }
    },

    onSandboxListLoaded: function() {
        this.$(".existing_table .spinner").stopLoading();

        var select = this.$(".existing_table select");
        select.append($("<option/>").prop('value', '').prop('selected', 'selected').text(t("selectbox.select_one")));

        this.tableMap = {};

        this.sandboxTables.each(function(model) {
            select.append($("<option/>").prop('value', model.get("objectName")).data("id", model.id).
                text(model.get("objectName")));

            this.tableMap[model.get("objectName")] = model.get("id");
        }, this);

        this.$(".existing_table .select").removeClass("hidden");


        chorus.styleSelect(this.$("select"));
    },

    additionalContext: function() {
        return {
            canonicalName: this.options.launchElement.data("canonicalName")
        }
    },

    makeModel: function() {
        this.resource = this.model = this.csv = new chorus.models.CSVImport({
            workspaceId: this.options.launchElement.data("workspaceId"),
            hasHeader: true
        });
    },

    uploadFile: function(e) {
        e && e.preventDefault();

        if (this.importTarget === "workfile") {
            this.$("button.submit").startLoading("actions.uploading");
            this.uploadObj.url = "/edc/workspace/" + this.options.launchElement.data("workspaceId") + "/workfile";
            this.uploadObj.source = "fs";
            this.request = this.uploadObj.submit();
        } else {
            if (this.importTarget === "existing") {
                this.datasetId = this.tableMap[this.$('select').val()]
            }

            var toTable = this.$('.new_table input:text').is(':disabled') ? this.$(".existing_table select").val() : chorus.models.CSVImport.normalizeForDatabase(this.$(".new_table input[type='text']").val())
            this.csv.set({
                toTable: toTable,
                truncate: this.$(".existing_table input#truncate").is(':checked')
            }, {silent: true})

            this.$("button.submit").startLoading("actions.uploading");

            this.uploadObj.url = "/edc/workspace/" + this.options.launchElement.data("workspaceId") + "/csv/sample";
            this.request = this.uploadObj.submit();
        }
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

        this.importTarget = "new"

        this.$("input[type=file]").fileupload({
            change: fileChosen,
            add: fileChosen,
            done: uploadFinished,
            dataType: "json"
        });

        function fileChosen(e, data) {
            self.$("button.submit").prop("disabled", false);
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

            self.$("input[type=file]").prop("title", t("dataset.import.change_file"));
        }

        function uploadFinished(e, data) {
            e && e.preventDefault();
            self.$("button.submit").stopLoading();

            if (self.importTarget === "workfile") {
                var workfile = new chorus.models.Workfile();
                workfile.set(workfile.parse(data.result), {silent: true});
                if (workfile.serverErrors) {
                    self.showErrors(workfile);
                } else {
                    chorus.toast("dataset.import.workfile_success", {fileName: workfile.get("fileName")});
                    chorus.router.navigate(workfile.hasOwnPage() ? workfile.showUrl() : workfile.workfilesUrl());
                }
            } else {
                var workingCsv = self.csv.clone();
                workingCsv.set(workingCsv.parse(data.result), {silent: true});
                if (workingCsv.serverErrors) {
                    self.csv.serverErrors = workingCsv.serverErrors;
                    self.csv.trigger("saveFailed");
                    fileChosen(e, data);
                } else {
                    if ((workingCsv.columnOrientedData().length === 0) && !workingCsv.serverErrors) {
                        var alert = new chorus.alerts.EmptyCSV();
                        alert.launchModal();
                    } else {
                        var dialog;
                        if (self.importTarget === "existing") {
                            dialog = new chorus.dialogs.ExistingTableImportCSV({csv: workingCsv, datasetId: self.datasetId});
                        } else {
                            dialog = new chorus.dialogs.NewTableImportCSV({csv: workingCsv});
                        }
                        chorus.PageEvents.subscribe("csv_import:started", self.closeModal, self);
                        dialog.launchModal();
                    }
                }
            }
        }
    }
});
