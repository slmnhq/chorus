chorus.dialogs.AssociateWithWorkspace = chorus.dialogs.PickWorkspace.extend({
    title: t("dataset.associate.title"),
    buttonTitle: t("dataset.associate.button"),

    setup: function () {
        this._super('setup', arguments)
        if (!this.model) {
            throw 'model required'
        }
    },

    callback: function() {
        var self = this;

        var params = {
            type: "SOURCE_TABLE",
            instanceId: this.model.get("instance").id,
            databaseName: this.model.get("databaseName"),
            schemaName: this.model.get("schemaName"),
            objectName: this.model.get("objectName"),
            objectType: this.model.get("objectType")
        }

        this.$("button.submit").startLoading("actions.associating");

        $.post("/edc/workspace/" + this.picklistView.selectedItem().get("id") + "/dataset", params,
            function(data) {
                if (data.status == "ok") {
                    self.model.activities().fetch();
                    self.closeModal();
                    chorus.toast("dataset.associate.toast", {datasetTitle: params.objectName, workspaceNameTarget: self.picklistView.selectedItem().get("name")});
                } else {
                    self.serverErrors = data.message;
                    self.render();
                }
            }, "json");
    }
});
