;(function($, ns) {
    ns.NotesNew = chorus.dialogs.Base.extend({
        className : "notes_new",
        title : t("notes.new_dialog.title"),
        events: {
            "submit form": "save"
        },
        makeModel : function(){
            this.entityType = this.options.launchElement.data("entity-type");
            this.entityId = this.options.launchElement.data("entity-id");

            this.model = new chorus.models.Note({
                entityType : this.entityType,
                entityId : this.entityId
            });

            this.model.bind("saved", this.saved, this);
        },

        save: function(e) {
            e.preventDefault();
            this.model.save({body : this.$("textarea[name=body]").val().trim()})
        },

        saved : function() {
            this.pageModel.trigger("invalidated");
            this.closeModal();
        },

        additionalContext : function() {
            return {entityType: this.entityType};
        }
    });
})(jQuery, chorus.dialogs);