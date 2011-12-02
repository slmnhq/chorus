;(function($, ns) {
    ns.NotesNew = chorus.dialogs.Base.extend({
        className : "notes_new",
        title : t("notes.new_dialog.title"),
        events: {
            "submit form": "save"
        },
        makeModel : function(){
            var self=this
            this.model = new chorus.models.Note({
                entityType : this.options.launchElement.data("entity-type"),
                entityId : this.options.launchElement.data("entity-id")
            });
            this.model.bind("saved", function(){self.closeModal()});
        },

        save: function(e) {
            e.preventDefault();
            this.model.set({body : this.$("textarea[name=body]").val()})
            this.model.save();
        }

    });
})(jQuery, chorus.dialogs);