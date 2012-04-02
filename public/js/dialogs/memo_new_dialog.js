chorus.dialogs.MemoNew = chorus.dialogs.Base.include(
    chorus.Mixins.ClEditor
).extend({
    className: "notes_new",
    persistent: true,
    events: {
        "submit form": "save",
        "click .show_options": "showOptions",
        "click .remove": "removeAttachment",
        "click .add_workfile": "launchWorkfileDialog",
        "click .add_dataset": "launchDatasetDialog",
        "click .cancel_upload": "cancelUpload"
    },

    setup: function() {
        this.recipients = new chorus.views.LinkMenu({
            options: [
                {data: "none", text: t("notification_recipient.none")},
                {data: "some", text: t("notification_recipient.some")}
            ],
            title: t("notification_recipient.title"),
            event: "choice"
        });
        this.notifications = new chorus.views.NotificationRecipient();
        this.subviews[".notification_recipients"] = "notifications";
        this.subviews[".recipients_menu"] = "recipients";

        this.recipients.bind("choice", this.onSelectRecipients, this);
    },

    onSelectRecipients: function(eventName, data) {
        var shouldHide = (data == "none");
        this.$(".notification_recipients").toggleClass("hidden", shouldHide);

        if (!shouldHide) {
            this.notifications.render();
        }
    },

    postRender: function() {
        this.$("input[type=file]").fileupload({
            add: _.bind(this.desktopFileChosen, this),
            dataType: "json",
            dropZone: this.$("input[type=file]"),
            progress: this.updateProgressBar
        });

        _.defer(_.bind(function() {
            this.makeEditor($(this.el), ".toolbar", "body", { width: 350 });
        }, this));
    },

    makeModel: function() {
        this._super("makeModel", arguments);

        this.bindings.add(this.model, "saved", this.modelSaved);
        this.bindings.add(this.model, "fileUploadSuccess", this.saved);
        this.bindings.add(this.model, "fileUploadFailed", this.saveFailed);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
        this.bindings.add(this.model, "validationFailed", this.saveFailed);
        this.bindings.add(this.model, "fileUploadDone", this.uploadDone);

        this.workspaceId = this.model.get("workspaceId");
    },

    cancelUpload: function() {
        _.each(this.model.files, function(fileModel) {
            fileModel.cancelUpload();
        })
    },

    modelSaved: function() {
        if (this.model.files.length) {
            this.initProgressBars();
            this.model.saveFiles();
        } else {
            this.saved();
        }
    },

    escapePressed: function() {
        if (this.uploadingFiles) {
            this.cancelUpload();
        } else {
            this._super("escapePressed");
        }
    },

    initProgressBars: function() {
        this.$(".remove").addClass("hidden");
        if (chorus.features.fileProgress) {
            this.$(".desktopfile .progress_bar").removeClass("hidden");
        } else {
            this.$(".desktopfile .progress_text").removeClass("hidden");
        }

        this.$(".workfile .upload_finished").removeClass("hidden");
        this.$(".modal_controls .cancel_upload").removeClass("hidden");
        this.$(".modal_controls .cancel").addClass("hidden");
        this.uploadingFiles = true;
    },

    updateProgressBar: function(e, data) {
        if (data.total != data.loaded) {
            data.fileDetailsElement.find(".progress_bar span").css('right', parseInt((data.total - data.loaded) / data.total * 100, 10));
        } else {
            data.fileDetailsElement.find(".progress_bar").addClass("hidden")
            data.fileDetailsElement.find(".progress_text").addClass("hidden")
            data.fileDetailsElement.find(".upload_finished").removeClass("hidden")
        }
    },

    uploadDone: function() {
        this.uploadingFiles = false;
    },

    save: function(e) {
        e && e.preventDefault();
        this.$(".attachment_links").addClass("disabled");
        this.$("button.submit").startLoading("notes.button.uploading");
        this.saving = true;
        this.model.save({
            body: this.getNormalizedText(this.$("textarea[name=body]")),
            recipients: this.$(".notification_recipients").is(".hidden") ? "" : this.notifications.getPickedUsers().join(",")
        });
    },

    saved: function() {
        this.pageModel.trigger("invalidated");
        this.$("button.submit").stopLoading();
        this.closeModal();
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
        this.showErrors();
        if (!this.model.isNew()) {
            this.model.destroy();
            this.model.unset('id');
        }
        this.$(".remove").removeClass("hidden");
        this.$(".progress_bar").addClass("hidden");
        this.$(".progress_text").addClass("hidden");
        this.$(".upload_finished").addClass("hidden");
        this.$(".modal_controls .cancel_upload").addClass("hidden");
        this.$(".modal_controls .cancel").removeClass("hidden");
        this.$(".attachment_links").removeClass("disabled");
        this.saving = false;
    },

    showErrors: function(model) {
        this._super("showErrors");

        if (!model) {
            model = this.resource
        }

        if(model.errors && model.errors.body){
            var $input = this.$(".cleditorMain");
            this.markInputAsInvalid($input, model.errors.body, true);

            this.$("iframe").contents().find("body").css("margin-right", "20px")
            this.$(".cleditorMain").css("width", "330px")
        }
    },

    additionalContext: function() {
        return {
            formUrl: this.model.url(),
            placeholder: this.placeholder,
            submitButton: this.submitButton || "Submit",
            allowWorkspaceAttachments: this.options.launchElement.data("allowWorkspaceAttachments")
        };
    },

    showOptions: function(e) {
        e.preventDefault();
        this.$(".options_text").addClass("hidden")
        this.$(".options_area").removeClass("hidden")
    },

    launchWorkfileDialog: function(e) {
        e.preventDefault();
        if (!this.saving) {
            var workfileDialog = new chorus.dialogs.WorkfilesAttach({ workspaceId: this.workspaceId, selectedAttachments: this.model.workfiles });
            workfileDialog.bind("files:selected", this.workfileChosen, this);
            this.launchSubModal(workfileDialog);
        }
    },

    launchDatasetDialog: function(e) {
        e.preventDefault();
        if (!this.saving) {
            var datasetDialog = new chorus.dialogs.DatasetsAttach({ workspaceId: this.workspaceId, selectedAttachments: this.model.datasets});
            datasetDialog.bind("datasets:selected", this.datasetsChosen, this);
            this.launchSubModal(datasetDialog);
        }
    },

    desktopFileChosen: function(e, data) {
        var uploadModel = new chorus.models.CommentFileUpload(data);
        this.model.addFileUpload(uploadModel);
        var file = data.files[0];
        var extension = _.last(file.name.split('.'));
        var iconSrc = chorus.urlHelpers.fileIconUrl(extension, "medium");

        file.isUpload = true
        this.showFile(file, file.name, iconSrc, uploadModel);
    },

    workfileChosen: function(workfileSet) {
        this.$(".file_details.workfile").remove();
        this.model.workfiles = workfileSet;
        this.model.workfiles.each(function(workfile) {
            var iconUrl = workfile.isImage() ? workfile.thumbnailUrl() : workfile.iconUrl({size: 'medium'});
            this.showFile(workfile, workfile.get("fileName"), iconUrl);
        }, this);
    },

    datasetsChosen: function(datasetSet) {
        this.$(".dataset_details.dataset").remove();
        this.model.datasets = datasetSet;
        this.model.datasets.each(function(dataset) {
            this.showDataset(dataset);
        }, this);
    },

    showDataset: function(dataset) {
        var datasetDetailsRow = $(Handlebars.helpers.renderTemplate("notes_new_file_attachment").toString());
        this.$(".options_area").append(datasetDetailsRow);

        var iconSrc = dataset.iconUrl({size: 'medium'});
        datasetDetailsRow.find('img.icon').attr('src', iconSrc);
        datasetDetailsRow.find('span.name').text(dataset.get("objectName")).attr('title', dataset.get("objectName"));
        datasetDetailsRow.data("attachment", dataset);
        datasetDetailsRow.removeClass("hidden");
        datasetDetailsRow.addClass("dataset dataset_details");
    },

    showFile: function(file, filename, iconSrc, uploadModel) {
        var fileDetailsRow = $(Handlebars.helpers.renderTemplate("notes_new_file_attachment").toString());
        this.$(".options_area").append(fileDetailsRow);

        fileDetailsRow.find('img.icon').attr('src', iconSrc);
        fileDetailsRow.find('span.name').text(filename).attr('title', filename);
        fileDetailsRow.data("attachment", file);
        fileDetailsRow.data("uploadModel", uploadModel);
        fileDetailsRow.removeClass("hidden");
        fileDetailsRow.addClass('file_details');
        if (file.isUpload) {
            uploadModel.data.fileDetailsElement = fileDetailsRow;
            fileDetailsRow.addClass("desktopfile");
        } else {
            fileDetailsRow.addClass("workfile");
        }
    },

    removeAttachment: function(e) {
        e.preventDefault();
        var row = $(e.target).closest(".row");
        var attachment = row.data("attachment");
        row.detach();

        if (row.hasClass('desktopfile')) {
            this.model.removeFileUpload(row.data('uploadModel'));
        } else if(row.hasClass('workfile')) {
            this.model.workfiles.remove(attachment);
        } else if(row.hasClass('dataset')) {
            this.model.datasets.remove(attachment);
        }
    }
});
