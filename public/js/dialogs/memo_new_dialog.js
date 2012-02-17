chorus.dialogs.MemoNew = chorus.dialogs.Base.extend({
    className:"notes_new",
    persistent:true,
    events:{
        "submit form":"save",
        "click .show_options":"showOptions",
        "click .remove":"removeFile",
        "click .add_workfile":"launchWorkfileDialog",
        "click .cancel_upload":"cancelUpload"
    },

    setup : function() {
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

    postRender:function () {
        this.$("input[type=file]").fileupload({
            add:_.bind(this.desktopFileChosen, this),
            dataType:"json",
            dropZone:this.$("input[type=file]"),
            progress:this.updateProgressBar
        });
    },

    makeModel:function () {
        this._super("makeModel", arguments);
        
        this.model.bind("saved", this.modelSaved, this);
        this.model.bind("fileUploadSuccess", this.saved, this);
        this.model.bind("fileUploadFailed", this.saveFailed, this);
        this.model.bind("saveFailed", this.saveFailed, this);
        this.model.bind("validationFailed", this.saveFailed, this);
        this.model.bind("fileUploadDone", this.uploadDone, this);

        this.workspaceId = this.model.get("workspaceId");
    },

    cancelUpload:function () {
        _.each(this.model.files, function (fileModel) {
            fileModel.cancelUpload();
        })
    },

    modelSaved:function () {
        if (this.model.files.length) {
            this.initProgressBars();
            this.model.saveFiles();
        } else {
            this.saved();
        }
    },

    escapePressed:function () {
        if (this.uploadingFiles) {
            this.cancelUpload();
        } else {
            this._super("escapePressed");
        }
    },

    initProgressBars:function () {
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

    updateProgressBar:function (e, data) {
        if (data.total != data.loaded) {
            data.fileDetailsElement.find(".progress_bar span").css('right', parseInt((data.total - data.loaded) / data.total * 100, 10));
        } else {
            data.fileDetailsElement.find(".progress_bar").addClass("hidden")
            data.fileDetailsElement.find(".progress_text").addClass("hidden")
            data.fileDetailsElement.find(".upload_finished").removeClass("hidden")
        }
    },

    uploadDone:function () {
        this.uploadingFiles = false;
    },

    save:function (e) {
        e && e.preventDefault();
        this.$(".attachment_links").addClass("disabled");
        this.$("button.submit").startLoading("notes.button.uploading");
        this.saving = true;
        this.model.save({
            body: this.$("textarea[name=body]").val().trim(),
            recipients: this.$(".notification_recipients").is(".hidden") ? "" : this.notifications.getPickedUsers().join(",")
        });
    },

    saved:function () {
        this.pageModel.trigger("invalidated");
        this.$("button.submit").stopLoading();
        this.closeModal();
    },

    saveFailed:function () {
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

    additionalContext:function () {
        return {
            displayEntityType:this.options.launchElement.data("displayEntityType") || this.model.get("entityType"),
            formUrl:this.model.url(),
            placeholder: this.placeholder,
            submitButton: this.submitButton || "Submit",
            allowWorkfileAttachments:this.options.launchElement.data("allowWorkfileAttachments")
        };
    },

    showOptions:function (e) {
        e.preventDefault();
        this.$(".options_text").addClass("hidden")
        this.$(".options_area").removeClass("hidden")
    },

    launchWorkfileDialog:function (e) {
        e.preventDefault();
        if (!this.saving) {
            var workfileDialog = new chorus.dialogs.WorkfilesAttach({ workspaceId:this.workspaceId, selectedFiles:this.model.workfiles });
            workfileDialog.bind("files:selected", this.workfileChosen, this);
            this.launchSubModal(workfileDialog);
        }
    },

    desktopFileChosen:function (e, data) {
        var uploadModel = new chorus.models.CommentFileUpload(data);
        this.model.addFileUpload(uploadModel);
        var file = data.files[0];
        var extension = _.last(file.name.split('.'));
        file.isUpload = true
        this.showFile(file, file.name, extension, uploadModel);
    },

    workfileChosen:function (workfileSet) {
        this.$(".file_details.workfile").remove();
        this.model.workfiles = workfileSet;
        this.model.workfiles.each(function (workfile) {
            this.showFile(workfile, workfile.get("fileName"), workfile.get("fileType"));
        }, this);
    },

    showFile:function (file, filename, filetype, uploadModel) {
        var fileDetailsRow = $(Handlebars.helpers.renderTemplate("notes_new_file_attachment"));
        this.$(".options_area").append(fileDetailsRow);

        var iconSrc = chorus.urlHelpers.fileIconUrl(filetype, "medium");
        fileDetailsRow.find('img.icon').attr('src', iconSrc);
        fileDetailsRow.find('span.file_name').text(filename).attr('title', filename);
        fileDetailsRow.data("file", file);
        fileDetailsRow.data("uploadModel", uploadModel);
        fileDetailsRow.removeClass("hidden");
        if (file.isUpload) {
            uploadModel.data.fileDetailsElement = fileDetailsRow;
            fileDetailsRow.addClass("desktopfile");
        } else {
            fileDetailsRow.addClass("workfile");
        }
    },

    removeFile:function (e) {
        e.preventDefault();
        var row = $(e.target).closest(".file_details");
        var file = row.data("file");
        row.detach();

        if (file.isUpload) {
            this.model.removeFileUpload(row.data('uploadModel'));
        } else {
            this.model.workfiles.remove(file);
        }
    }
});