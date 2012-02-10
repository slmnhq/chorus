chorus.dialogs.CopyWorkfile = chorus.dialogs.PickWorkspace.extend({
    title:t("workfile.copy_dialog.title"),
    buttonTitle: t("workfile.copy_dialog.copy_file"),

    persistent:true,

    setup:function () {
        this._super("setup");
        this.workfile = new chorus.models.Workfile({ id:this.options.launchElement.data("workfile-id"), workspaceId:this.options.launchElement.data("workspace-id") });
        this.workfile.fetch();
    },

    workspacesFetched: function() {
        var currentWorkspace = this.collection.get(this.workfile.get("workspaceId"));
        this.collection.remove(currentWorkspace);
        this._super("workspacesFetched", arguments);
    },

    callback:function () {
        var self = this;

        var params = {
            source:"chorus",
            fileName:this.workfile.get("fileName"),
            workfileId:this.workfile.get("id")
        }

        var description = this.workfile.get("description");
        if (description) {
            params.description = description;
        }

        $.post("/edc/workspace/" + this.picklistView.selectedItem().get("id") + "/workfile", params,
            function (data) {
                if (data.status == "ok") {
                    self.closeModal();
                    chorus.toast("workfile.copy_dialog.toast", {workfileTitle:params.fileName, workspaceNameTarget:self.picklistView.selectedItem().get("name")});
                } else {
                    self.serverErrors = data.message;
                    self.render();
                }
            }, "json");
    }
});
