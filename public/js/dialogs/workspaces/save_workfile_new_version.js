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

        makeModel : function() {
            this._super("makeModel", arguments);
            this.model = this.pageModel.createNewVersion();
        },

        saveWorkfileNewVersion : function(e) {
            e.preventDefault();
            this.model.set({"commitMessage" : this.$("[name=commitMessage]").val()}, {silent : true});
            this.model.save();
            
        },

        saved : function() {
            this.pageModel.set({"versionNum" : this.model.get("versionNum"),
                                "versionFileId" : this.model.get("versionFileId")});
            this.model.trigger("autosaved");
            this.closeModal();
        }
    });
})(jQuery, chorus.dialogs);