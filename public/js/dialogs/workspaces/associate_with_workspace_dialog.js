chorus.dialogs.AssociateWithWorkspace = chorus.dialogs.PickWorkspace.extend({
    title: t("dataset.associate.title"),
    buttonTitle: t("dataset.associate.button"),

    callback: function() {
        var self = this;

        var params = {
            type: this.pageModel.get("type"),
            instanceId: this.pageModel.get("instance").id,
            databaseName: this.pageModel.get("databaseName"),
            schemaName: this.pageModel.get("schemaName"),
            objectName: this.pageModel.get("objectName"),
            objectType: this.pageModel.get("objectType")
        }

        this.$("button.submit").startLoading("actions.associating");

        $.post("/edc/workspace/" + this.picklistView.selectedItem().get("id") + "/dataset", params,
            function(data) {
                if (data.status == "ok") {
                    self.pageModel.activities().fetch();
                    self.closeModal();
                    chorus.toast("dataset.associate.toast", {datasetTitle: params.objectName, workspaceNameTarget: self.picklistView.selectedItem().get("name")});
                } else {
                    self.serverErrors = data.message;
                    self.render();
                }
            }, "json");
    }
});
