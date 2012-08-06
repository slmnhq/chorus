chorus.dialogs.DatasetImport = chorus.dialogs.Base.extend({
    constructorName: "DatasetImport",

    templateName: "dataset_import",
    title: t("dataset.import.title"),

    events: {
        "change input:radio": "onRadioSelect",
        "submit form": "uploadFile",
        "click button.submit": "uploadFile",
        "click a.dataset_picked": "launchDatasetPickerDialog"
    },

    launchDatasetPickerDialog: function(e) {
        e.preventDefault();
        if (!this.saving) {
            var datasetDialog = new chorus.dialogs.ImportDatasetsPicker({ workspaceId: this.options.workspaceId });
            this.bindings.add(datasetDialog, "datasets:selected", this.datasetsChosen, this);
            this.launchSubModal(datasetDialog);
        }
    },

    datasetsChosen: function(dataset) {
        this.selectedDataset = dataset[0];
        this.changeSelectedDataset(dataset && dataset[0] && dataset[0].name());
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
            this.$("a.dataset_picked").addClass("hidden");

            if (this.selectedDataset) {
                this.$("span.dataset_picked").removeClass("hidden");
            }

        } else if (this.importTarget == "existing") {
            this.$("a.dataset_picked").removeClass("hidden");
            this.$("span.dataset_picked").addClass("hidden");

            this.$(".existing_table .options").removeClass("hidden");
            this.$(".existing_table .options input").prop("disabled", false);
        }

        this.enableButton();
    },

    changeSelectedDataset: function(name) {
        this.$(".existing_table a.dataset_picked").text(_.prune(name, 20));
        this.$(".existing_table span.dataset_picked").text(_.prune(name, 20));

        this.enableButton();
    },

    enableButton: function() {
        if (this.selectedDataset || this.importTarget !== "existing") {
            this.$("button.submit").prop("disabled", false);
        } else {
            this.$("button.submit").prop("disabled", true);
        }
    },

    additionalContext: function() {
        return { canonicalName: this.options.canonicalName };
    },

    makeModel: function() {
        this.resource = this.model = this.csv = new chorus.models.CSVImport({ workspaceId: this.options.workspaceId });
        this.csvOptions = {hasHeader: true};
    },

    importDestination: function() {
        if (this.importTarget === "existing") {
            return (this.selectedDataset && this.selectedDataset.name()) || "";
        } else if (this.importTarget === "new") {
            return chorus.utilities.CsvParser.normalizeForDatabase(this.$('.new_table input:text').val());
        }
    },

    uploadFile: function(e) {
        e && e.preventDefault();

        if (this.importTarget === "workfile") {
            this.$("button.submit").startLoading("actions.uploading");
            this.uploadObj.url = "/workspace/" + this.options.workspaceId + "/workfile";
            this.uploadObj.source = "fs";
            this.request = this.uploadObj.submit();

        } else {
            this.csvOptions.tableName = this.importDestination();

            this.csv.set({
                destinationType: this.importTarget,
                toTable: this.importDestination(),
                truncate: this.$(".existing_table input#truncate").is(':checked')
            }, {silent: true});

            this.uploadObj.url = "/workspaces/" + this.options.workspaceId + "/csv";

            if (this.csv.performValidation()) {
                this.$("button.submit").startLoading("actions.uploading");
                this.clearErrors();
                this.request = this.uploadObj.submit();
            } else {
                this.showErrors(this.model);
            }
        }
    },

    modalClosed: function() {
        if (this.request) {
            this.request.abort();
        }

        this._super("modalClosed");
    },

    uploadFailed: function(e, response) {
        e && e.preventDefault();
        this.model.serverErrors = JSON.parse(response.jqXHR.responseText).errors;
        this.model.trigger("saveFailed");
    },

    uploadFinished: function(e, data) {
        e && e.preventDefault();
        this.$("button.submit").stopLoading();
    },

    uploadSuccess: function(e, data) {
        e && e.preventDefault();

        if (this.importTarget === "workfile") {
            var workfile = new chorus.models.Workfile();
            workfile.set(workfile.parse(data.result), {silent: true});

            chorus.toast("dataset.import.workfile_success", {fileName: workfile.get("fileName")});
            chorus.router.navigate(workfile.hasOwnPage() ? workfile.showUrl() : workfile.workfilesUrl());
        } else {
            var workingCsv = this.model.clone();
            workingCsv.set(workingCsv.parse(data.result), {silent: true});

            this.csvOptions.contents = workingCsv.get('contents');

            var csvParser = new chorus.utilities.CsvParser(workingCsv.get('contents'), this.csvOptions);
            if ((csvParser.getColumnOrientedData().length === 0) && !csvParser.serverErrors) {
                var alert = new chorus.alerts.EmptyCSV();
                alert.launchModal();
            } else {
                var dialog;
                if (this.importTarget === "existing") {
                    dialog = new chorus.dialogs.ExistingTableImportCSV({model: workingCsv, datasetId: this.selectedDataset.get("id"), csvOptions: this.csvOptions});
                } else {
                    dialog = new chorus.dialogs.NewTableImportCSV({model: workingCsv, csvOptions: this.csvOptions});
                }
                chorus.PageEvents.subscribe("csv_import:started", this.closeModal, this);
                dialog.launchModal();
            }
        }
    },
    
    fileChosen: function(e, data) {
        this.$("button.submit").prop("disabled", false);
        this.$('.empty_selection').addClass('hidden');
        
        this.uploadObj = data;
        var filename = data.files[0].name;
        var filenameComponents = filename.split('.');
        var basename = _.first(filenameComponents);
        var extension = _.last(filenameComponents);
        this.$(".file_name").text(filename);
        this.$(".new_table input[type='text']").val(basename.toLowerCase().replace(/ /g, '_'));
        
        this.$("img").removeClass("hidden");
        this.$("img").attr("src", chorus.urlHelpers.fileIconUrl(extension, "medium"));
        
        this.$(".import_controls").removeClass("hidden");
        
        this.$(".file-wrapper a").removeClass("hidden");
        this.$(".file-wrapper button").addClass("hidden");
        
        this.$("input[type=file]").prop("title", t("dataset.import.change_file"));
    },
    
    postRender: function() {
        this.importTarget = "new";

        this.$("input[type=file]").fileupload({
            change: _.bind(this.fileChosen, this),
            add: _.bind(this.fileChosen, this),
            done: _.bind(this.uploadSuccess, this),
            fail: _.bind(this.uploadFailed, this),
            always: _.bind(this.uploadFinished, this),
            dataType: "json"
        });

    }
});
