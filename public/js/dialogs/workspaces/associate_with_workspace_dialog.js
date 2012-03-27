chorus.dialogs.AssociateWithWorkspace = chorus.dialogs.PickWorkspace.extend({
    title: t("dataset.associate.title"),
    buttonTitle: t("dataset.associate.button"),

    setup: function () {
        this._super('setup', arguments);
        if (!this.model) {
            throw 'model required'
        }
    },

    callback: function() {
        var self = this;

        var url;
        var params ;
        if(this.model.get("type") == "CHORUS_VIEW") {
            url = "/edc/workspace/" + this.model.get("workspace").id + "/dataset/" + this.model.get("id");
            params = {
                targetWorkspaceId:   this.picklistView.selectedItem().get("id"),
                objectName: this.model.get("objectName")
            };
        } else {
            url = "/edc/workspace/" + this.picklistView.selectedItem().get("id") + "/dataset";
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
                    chorus.toast("dataset.associate.toast", {datasetTitle: params.objectName, workspaceNameTarget: self.picklistView.selectedItem().get("name")});
                    chorus.PageEvents.broadcast("workspace:associated");
                } else {
                    self.serverErrors = data.message;
                    self.render();
                };
            }, "json");
    }
});
