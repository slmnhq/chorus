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
                formUrl : this.model.url()
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
            var filename = data.files[0].name;
            var extension = _.last(filename.split('.'));
            var file = new chorus.models.Base({ fileName: filename, fileType: extension });
            file.isUpload = true;

            this.showFile(file);
        },

        workfileChosen : function(workfileSet) {
            this.workfiles = workfileSet;
            this.workfiles.each(function(workfile) {
                this.showFile(workfile);
            }, this);
        },

        showFile: function(file) {
            var fileDetailsRow = this.$(".file_details").eq(0).
                clone().
                appendTo(this.$(".options_area"));

            var filename = file.get("fileName");
            var iconSrc = chorus.urlHelpers.fileIconUrl(file.get("fileType"), "medium");
            fileDetailsRow.find('img').attr('src', iconSrc);
            fileDetailsRow.find('span.file_name').text(filename).attr('title', filename);
            fileDetailsRow.data("file", file);
            fileDetailsRow.removeClass("hidden");
        },

        removeFile : function(e) {
            e.preventDefault();
            var row = $(e.target).closest(".file_details");
            var file = row.data("file");
            row.remove();

            if (file.isUpload) {
                delete this.model.uploadObj;
            } else {
                this.workfiles.remove(file);
            }
        }
    });
})(jQuery, chorus.dialogs);
