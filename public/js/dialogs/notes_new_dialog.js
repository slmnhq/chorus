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

            var self=this
            this.model = new chorus.models.Note({
                entityType : this.entityType,
                entityId : this.entityId
            });
            this.model.bind("saved", function(){self.closeModal()});
        },

        save: function(e) {
            e.preventDefault();
            this.model.set({body : this.$("textarea[name=body]").val().trim()})
            this.model.save();
        },

        additionalContext : function() {
            return {entityType: this.entityType};
        }
    });
})(jQuery, chorus.dialogs);