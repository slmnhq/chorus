chorus.dialogs.InstanceEdit = chorus.dialogs.Base.extend({
    constructorName: "InstanceEdit",

    templateName: "instance_edit",
    title: t("instances.edit_dialog.title"),
    events: {
        "submit form": "save"
    },
    makeModel: function() {
        this.sourceModel = this.options.launchElement.data("instance")
        this.model = new chorus.models.Instance(this.sourceModel.attributes);
    },

    setup: function() {
        this.bindings.add(this.model, "saved", this.saveSuccess);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
        this.bindings.add(this.model, "validationFailed", this.saveFailed);
    },

    additionalContext: function() {
        return {
            registeredInstance: this.model.get("provision_type") == "register",
            provisionedInstance: this.model.get("provision_type") == "create",
            hadoopInstance: this.model.get("provision_type") == "registerHadoop"
        };
    },

    save: function(e) {
        e.preventDefault();
        var attrs = {
            name: this.$("input[name=name]").val().trim(),
            description: this.$("textarea[name=description]").val().trim(),
            host: this.$("input[name=host]").val(),
            port: this.$("input[name=port]").val(),
            provision_type: this.model.get("provision_type")
        };

        _(["size", "maintenance_db", "userName", "userGroups"]).each(function(name) {
            var input = this.$("input[name=" + name + "]")
            if (input) {
                attrs[name] = input.val();
            }
        }, this)

        this.$("button.submit").startLoading("instances.edit_dialog.saving");
        this.$("button.cancel").prop("disabled", true);
        this.model.save(attrs, {silent: true});
    },

    saveSuccess: function() {
        this.sourceModel.set(this.model.attributes);
        chorus.toast("instances.edit_dialog.saved_message");
        this.closeModal();
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
        this.$("button.cancel").prop("disabled", false);
    }
});
