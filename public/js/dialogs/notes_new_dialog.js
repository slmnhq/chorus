;(function($, ns) {
    ns.NotesNew = chorus.dialogs.Base.extend({
        className : "notes_new",
        title : t("notes.new_dialog.title"),
        persistent : true,
        events: {
            "submit form": "save",
            "click .show_options": "showOptions",
            "click .remove": "removeFile"
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
            //form attrs need to be named the same as the model attrs, for the fileUpload plugin to magically work.
            //when there is a fileUploadObj, the values set here, are not respected, with the form taking precedence.
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

        fileChosen : function(e, data) {
            this.model.uploadObj = data;
            var filename = data.files[0].name;
            this.uploadExtension = _.last(filename.split('.'));
            var iconSrc = chorus.urlHelpers.fileIconUrl(this.uploadExtension, "medium");
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
