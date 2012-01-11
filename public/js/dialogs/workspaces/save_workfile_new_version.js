(function($, ns) {
    ns.WorkfileNewVersion = chorus.dialogs.Base.extend({
        className : "workfile_new_version",
        title : t("workfile.new_version_dialog.title"),

        persistent: true,

        events : {
            "submit form" : "saveWorkfileNewVersion"
        },

        setup : function(){
            this.model.bind("saved", this.saved, this);
        },

        saveWorkfileNewVersion : function(e) {
            e.preventDefault();
            this.model.set({"commitMessage" : this.$("[name=commitMessage]").val()}, {silent : true});
            this.model.save();
            
        },

        saved : function() {
            this.closeModal();
            this.model.trigger("autosaved");
        }
    });
})(jQuery, chorus.dialogs);