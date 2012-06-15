chorus.dialogs.AssociateWithWorkspace = chorus.dialogs.PickWorkspace.extend({
    constructorName: "AssociateWithWorkspace",

    title: t("dataset.associate.title.one"),
    submitButtonTranslationKey: "dataset.associate.button.one",

    setup: function() {
        this.requiredResources.add(this.collection);
        this._super('setup', arguments);
    },

    resourcesLoaded: function() {
        if (this.model.has("workspace")) {
            this.collection.remove(this.collection.get(this.model.workspace().id));
        }

        this.model.workspacesAssociated().each(function(workspace) {
            this.collection.remove(this.collection.get(workspace.id));
        }, this);

        this.render();
    },

    submit: function() {
        var self = this;
        var url, params;

        if (this.model.get("type") == "CHORUS_VIEW") {
            url = "/workspaces/" + this.model.get("workspace").id + "/datasets/" + this.model.get("id");
            params = {
                targetWorkspaceId: this.selectedItem().get("id"),
                objectName: this.model.get("objectName")
            };

            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",

                data: params,

                success: this.saved,
                error: this.saveFailed
            });
        } else {
            var datasetSet = this.selectedItem().datasets();
            datasetSet.reset([this.model]);
            this.bindings.add(datasetSet, "saved", this.saved);
            this.bindings.add(datasetSet, "saveFailed", this.bulkSaveFailed);

            datasetSet.save();
        }
        this.$("button.submit").startLoading("actions.associating");
    },

    saved: function() {
        this.model.activities().fetch();
        this.closeModal();
        chorus.toast("dataset.associate.toast.one", {datasetTitle: this.model.get("objectName"), workspaceNameTarget: this.selectedItem().get("name")});
        chorus.PageEvents.broadcast("workspace:associated");
    },

    saveFailed: function(xhr) {
        var data = JSON.parse(xhr.responseText);
        this.serverErrors = data.errors;
        this.render();
    },

    bulkSaveFailed: function(model) {
        this.serverErrors = model.serverErrors;
        this.render();
    }
});
