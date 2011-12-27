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
                add : _.bind(this.fileChosen, this),
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

        fileChosen : function(e, data) {
            this.model.uploadObj = data;
            var filename = data.files[0].name;
            var extension = _.last(filename.split('.'));

            this.showFile(filename, extension);
        },

        workfileChosen : function(workfileSet) {
            var workfile = workfileSet.first();
            var filename = workfile.get("fileName");
            var extension = workfile.get("fileType");

            this.showFile(filename, extension);
        },

        showFile: function(filename, extension) {
            var iconSrc = chorus.urlHelpers.fileIconUrl(extension, "medium");
            this.$('img').attr('src', iconSrc);
            this.$('span.file_name').text(filename).attr('title',filename);
            this.$(".file_details").show();
        },

        removeFile : function(e){
            e.preventDefault();
            delete this.model.uploadObj;
            this.$(".file_details").hide();
        }
    });
})(jQuery, chorus.dialogs);
