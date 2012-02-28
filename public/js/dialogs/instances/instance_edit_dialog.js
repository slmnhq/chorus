chorus.dialogs.InstancesEdit = chorus.dialogs.Base.extend({
    className:"instance_edit",
    title:t("instances.edit_dialog.title"),
    events:{
        "submit form":"save"
    },
    makeModel:function () {
        this.model = this.options.pageModel;

        this.users = new chorus.collections.UserSet();
        this.fetchUserSet();
        this.bindings.add(this.users, "reset", this.render);
    },

    setup:function () {
        this.bindings.add(this.model, "saved", this.saveSuccess);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
        this.bindings.add(this.model, "validationFailed", this.saveFailed);
    },

    additionalContext:function () {
        return {
            registeredInstance:this.options.pageModel.get("provisionType") == "register",
            provisionedInstance:this.options.pageModel.get("provisionType") == "create",
            users:this.users.models
        }
    },

    save:function (e) {
        e.preventDefault();

        var attrs = {
            name:this.$("input[name=name]").val().trim(),
            description:this.$("textarea[name=description]").val().trim(),
            host:this.$("input[name=host]").val(),
            port:this.$("input[name=port]").val(),
            size:this.$("input[name=size]").val()
        }

        this.$("button.submit").startLoading("instances.edit_dialog.saving");
        this.$("button.cancel").attr("disabled", "disabled");
        this.model.set(attrs, { silent:true })
        this.model.save();
    },

    saveSuccess:function () {
        chorus.toast("instances.edit_dialog.saved_message");
        this.closeModal();
    },

    saveFailed:function () {
        this.$("button.submit").stopLoading();
        this.$("button.cancel").removeAttr("disabled");
    },

    fetchUserSet:function () {
        if (this.model.isShared()) {
            this.users.fetchAll();
        } else {
            this.accounts = this.accounts || new chorus.collections.InstanceAccountSet({}, { instanceId:this.model.get("id") });
            this.accounts.fetchAll();
            this.bindings.add(this.accounts, "reset", function () {
                this.users.add(this.accounts.users());
                this.users.trigger("reset");
            });
        }
    }
});
