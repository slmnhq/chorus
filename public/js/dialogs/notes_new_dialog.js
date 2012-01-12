;(function($, ns) {
    ns.NotesNew = chorus.dialogs.Base.extend({
        className : "notes_new",
        title : t("notes.new_dialog.title"),
        persistent : true,
        events: {
            "submit form": "save",
            "click .show_options": "showOptions",
            "click .remove": "removeFile",
            "click .add_workfile": "launchWorkfileDialog"
        },

        postRender : function() {
            this.$("input[type=file]").fileupload({
                add : _.bind(this.desktopFileChosen, this),
                dataType : "json",
                dropZone : this.$("input[type=file]")
            });
        },

        makeModel : function() {
            this._super("makeModel", arguments);

            this.model = new chorus.models.Comment({
                entityType : this.options.launchElement.data("entity-type"),
                entityId : this.options.launchElement.data("entity-id")
            });
            this.model.bind("saved", this.modelSaved, this);
            this.model.bind("fileUploadSuccess", this.saved, this);
            this.model.bind("fileUploadFailed", this.saveFailed, this);
            this.model.bind("saveFailed", this.saveFailed, this);
            this.model.bind("validationFailed", this.saveFailed, this);

            this.workspaceId = this.options.launchElement.data("workspace-id");
        },

        modelSaved: function() {
            if(this.model.files.length) {
                this.model.saveFiles();
            } else {
                this.saved();
            }
        },
        save: function(e) {
            e.preventDefault();
            this.$("button.submit").startLoading("notes.button.uploading");
            this.model.save({ body : this.$("textarea[name=body]").val().trim() });
        },

        saved : function() {
            this.pageModel.trigger("invalidated");
            this.$("button.submit").stopLoading();
            this.closeModal();
        },

        saveFailed : function() {
            this.$("button.submit").stopLoading();
            this.showErrors();
        },

        additionalContext : function() {
            return {
                entityType: this.model.get("entityType"),
                formUrl : this.model.url(),
                multipleFileUpload: chorus.features.multipleFileUpload,
                allowWorkfileAttachments : this.options.launchElement.data("allowWorkfileAttachments")
            };
        },

        showOptions : function(e) {
            e.preventDefault();
            this.$(".options_text").hide();
            this.$(".options_area").show();
        },

        launchWorkfileDialog: function(e) {
            e.preventDefault();
            var workfileDialog = new ns.WorkfilesAttach({ workspaceId : this.workspaceId, selectedFiles: this.model.workfiles });
            workfileDialog.bind("files:selected", this.workfileChosen, this);
            this.launchSubModal(workfileDialog);
        },

        desktopFileChosen : function(e, data) {
            var uploadModel = new chorus.models.CommentFileUpload(data);
            this.model.addFileUpload(uploadModel);
            var file = data.files[0];
            var extension = _.last(file.name.split('.'));
            file.isUpload = true
            this.showFile(file, file.name, extension, uploadModel);
        },

        workfileChosen : function(workfileSet) {
            this.$(".file_details.workfile").remove();
            this.model.workfiles = workfileSet;
            this.model.workfiles.each(function(workfile) {
                this.showFile(workfile, workfile.get("fileName"), workfile.get("fileType"));
            }, this);
        },

        showFile: function(file, filename, filetype, uploadModel) {
            var fileDetailsRow = $(Handlebars.helpers.renderTemplate("notes_new_file_attachment"));
            this.$(".options_area").append(fileDetailsRow);

            var iconSrc = chorus.urlHelpers.fileIconUrl(filetype, "medium");
            fileDetailsRow.find('img').attr('src', iconSrc);
            fileDetailsRow.find('span.file_name').text(filename).attr('title', filename);
            fileDetailsRow.data("file", file);
            fileDetailsRow.data("uploadModel", uploadModel);
            fileDetailsRow.removeClass("hidden");
            if (!file.isUpload){
                fileDetailsRow.addClass("workfile");
            }
        },

        removeFile : function(e) {
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
})(jQuery, chorus.dialogs);
