chorus.dialogs.WorkfileNewVersion = chorus.dialogs.Base.extend({
    constructorName: "WorkfileNewVersion",

    templateName:"workfile_new_version",
    title:t("workfile.new_version_dialog.title"),

    persistent:true,

    events:{
        "submit form":"saveWorkfileNewVersion"
    },

    setup:function () {
        this.bindings.add(this.model, "saved", this.saved);
    },

    makeModel:function () {
        this._super("makeModel", arguments);
        this.model = this.pageModel;
    },

    saveWorkfileNewVersion:function (e) {
        e.preventDefault();
        this.model.set({"commitMessage":this.$("[name=commitMessage]").val()}, {silent:true});
        this.model.saveAsNewVersion();
    },

    saved:function () {
        this.pageModel.trigger("invalidated");
        this.closeModal();
    }
});
