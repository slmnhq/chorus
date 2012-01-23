(function(ns) {
    ns.dialogs.WorkfileNewVersion = ns.dialogs.Base.extend({
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
            this.model = this.pageModel;
        },

        saveWorkfileNewVersion : function(e) {
            e.preventDefault();
            this.model.set({"commitMessage" : this.$("[name=commitMessage]").val()}, {silent : true});
            this.model.saveAsNewVersion();
        },

        saved : function() {
            this.pageModel.trigger("invalidated");
            this.closeModal();
        }
    });
})(chorus);