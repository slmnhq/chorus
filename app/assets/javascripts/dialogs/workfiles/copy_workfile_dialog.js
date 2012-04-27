chorus.dialogs.CopyWorkfile = chorus.dialogs.PickWorkspace.extend({
    constructorName: "CopyWorkfile",

    title: t("workfile.copy_dialog.title"),
    submitButtonTranslationKey: "workfile.copy_dialog.copy_file",

    setup: function() {
        this.workfile = new chorus.models.Workfile({ id: this.options.launchElement.data("workfile-id"), workspaceId: this.options.launchElement.data("workspace-id") });
        this.requiredResources.add(this.workfile);
        this.requiredResources.add(this.collection);
        this.workfile.fetch();

        this._super("setup", arguments);
    },

    resourcesLoaded: function() {
        this.collection.remove(this.collection.get(this.workfile.get("workspaceId")));
        this.render();
    },

    submit: function() {
        var self = this;
        var workfile = this.workfile;

        var params = {
            source: "chorus",
            fileName: workfile.get("fileName"),
            workfileId: workfile.get("id")
        }

        var description = workfile.get("description");
        if (description) {
            params.description = description;
        }

        $.post("/workspace/" + this.selectedItem().get("id") + "/workfile", params,
            function(data) {
                if (workfile.dataStatusOk(data)) {
                    self.closeModal();
                    var copiedWorkfile = new chorus.models.Workfile(workfile.parse(data));
                    chorus.toast("workfile.copy_dialog.toast", {workfileTitle: copiedWorkfile.get("fileName"), workspaceNameTarget: self.selectedItem().get("name")});
                } else {
                    self.serverErrors = data.message;
                    self.render();
                }
            }, "json");
    }
});
