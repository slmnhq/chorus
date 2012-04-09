chorus.dialogs.AssociateWithWorkspace = chorus.dialogs.PickWorkspace.extend({
    title: t("dataset.associate.title"),
    buttonTitle: t("dataset.associate.button"),

    setup: function () {
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

    callback: function() {
        var self = this;
        var url, params;

        if(this.model.get("type") == "CHORUS_VIEW") {
            url = "/edc/workspace/" + this.model.get("workspace").id + "/dataset/" + this.model.get("id");
            params = {
                targetWorkspaceId: this.selectedItem().get("id"),
                objectName: this.model.get("objectName")
            };
        } else {
            url = "/edc/workspace/" + this.selectedItem().get("id") + "/dataset";
            params = {
                type: "SOURCE_TABLE",
                instanceId: this.model.get("instance").id,
                databaseName: this.model.get("databaseName"),
                schemaName: this.model.get("schemaName"),
                objectName: this.model.get("objectName"),
                objectType: this.model.get("objectType")
            };
        }
        this.$("button.submit").startLoading("actions.associating");

        $.post(url, params,
            function(data) {
                if (data.status == "ok") {
                    self.model.activities().fetch();
                    self.closeModal();
                    chorus.toast("dataset.associate.toast", {datasetTitle: params.objectName, workspaceNameTarget: self.selectedItem().get("name")});
                    chorus.PageEvents.broadcast("workspace:associated");
                } else {
                    self.serverErrors = data.message;
                    self.render();
                };
            }, "json");
    }
});
