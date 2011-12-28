;(function($, ns) {
    ns.NotesNew = chorus.dialogs.Base.extend({
        className : "notes_new",
        title : t("notes.new_dialog.title"),
        persistent : true,
        events: {
            "submit form": "save",
            "click .show_options": "showOptions",
            "click .remove": "removeFile",
            "click .workfile": "launchWorkfileDialog"
        },

        postRender : function() {
            this.$("input[type=file]").fileupload({
                singleFileUploads : false,
                add : _.bind(this.desktopFileChosen, this),
                dataType : "text"
            });
        },

        makeModel : function(options){
            this._super("makeModel", options);

            this.model = new chorus.models.Note({
                entityType : this.options.launchElement.data("entity-type"),
                entityId : this.options.launchElement.data("entity-id")
            });
            this.model.bind("saved", this.saved, this);
        },

        save: function(e) {
            e.preventDefault();
            this.model.save({ body : this.$("textarea[name=body]").val().trim() });
        },

        saved : function() {
            this.pageModel.trigger("invalidated");
            this.closeModal();
        },

        additionalContext : function() {
            return {
                entityType: this.model.get("entityType"),
                formUrl : this.model.url(),
                multipleFileUpload: chorus.features.multipleFileUpload
            };
        },

        showOptions : function(e) {
            e.preventDefault();
            this.$(".options_text").hide();
            this.$(".options_area").show();
        },

        launchWorkfileDialog: function(e) {
            e.preventDefault();
            var workfileDialog = new ns.WorkfilesAttach({ workspaceId : this.model.get("entityId") });
            workfileDialog.bind("files:selected", this.workfileChosen, this);
            this.launchSubModal(workfileDialog);
        },

        desktopFileChosen : function(e, data) {
            this.model.uploadObj = data;
            var self = this;
            _.each(data.files, function(file) {
                var extension = _.last(file.name.split('.'));
                file.isUpload = true
                self.showFile(file, file.name, extension);
            });
        },

        workfileChosen : function(workfileSet) {
            this.model.workfiles = workfileSet;
            this.model.workfiles.each(function(workfile) {
                this.showFile(workfile, workfile.get("fileName"), workfile.get("fileType"));
            }, this);
        },

        showFile: function(file, filename, filetype) {
            var fileDetailsRow = $(Handlebars.helpers.renderTemplate("notes_new_file_attachment"));
            this.$(".options_area").append(fileDetailsRow);

            var iconSrc = chorus.urlHelpers.fileIconUrl(filetype, "medium");
            fileDetailsRow.find('img').attr('src', iconSrc);
            fileDetailsRow.find('span.file_name').text(filename).attr('title', filename);
            fileDetailsRow.data("file", file);
            fileDetailsRow.removeClass("hidden");
        },

        removeFile : function(e) {
            e.preventDefault();
            var row = $(e.target).closest(".file_details");
            var file = row.data("file");
            row.detach();

            if (file.isUpload) {
                var fileIndex = _.indexOf(this.model.uploadObj.files, file);
                this.model.uploadObj.files.splice(fileIndex, 1);
                if(this.model.uploadObj.files.length == 0) {
                    delete this.model.uploadObj;
                }
            } else {
                this.model.workfiles.remove(file);
            }
        }
    });
})(jQuery, chorus.dialogs);
