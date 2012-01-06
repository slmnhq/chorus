(function($, ns) {
    ns.dialogs.InstancesEdit = chorus.dialogs.Base.extend({
        className : "instances_edit",
        title : t("instances.edit_dialog.title"),
        events : {
            "submit form" : "save"
        },
        makeModel : function() {
            this.model = this.options.pageModel;

            this.users = new chorus.models.UserSet();
            this.fetchUserSet();
            this.users.bind("reset", this.render, this);
        },

        setup: function() {
            this.model.bind("saved", this.saveSuccess, this);
            this.model.bind("saveFailed", this.saveFailed, this);
            this.model.bind("validationFailed", this.saveFailed, this);
        },

        additionalContext : function() {
            return {
                registeredInstance: this.options.pageModel.get("provisionType") == "register" ,
                provisionedInstance: this.options.pageModel.get("provisionType") == "create",
                users : this.users.models
            }
        },

        closeModal : function() {
            this.model.unbind("saved", this.saveSuccess);
            this.model.unbind("saveFailed", this.saveFailed);
            this.model.unbind("validationFailed", this.saveFailed);
            this._super("closeModal", arguments);
        },

        save : function(e) {
            e.preventDefault();

            var attrs = {
            name: this.$("input[name=name]").val().trim(),
            description: this.$("textarea[name=description]").val().trim(),
            host : this.$("input[name=host]").val(),
            port : this.$("input[name=port]").val(),
            size : this.$("input[name=size]").val(),
            ownerId: this.$("select.owner").val()
        }

            this.$("button.submit").startLoading("instances.edit_dialog.saving");
            this.$("button.cancel").attr("disabled", "disabled");
            this.model.save(attrs);
        },

        postRender : function() {
            this.$("select.owner").val(this.model.get("ownerId"));
        },

        saveSuccess : function() {
            chorus.toast("instances.edit_dialog.saved_message");
            this.closeModal();
        },

        saveFailed : function() {
            this.$("button.submit").stopLoading();
            this.$("button.cancel").removeAttr("disabled");
        },

        fetchUserSet : function() {
            if (this.model.isShared()) {
                this.users.fetchAll();
            } else {
                this.accounts = this.accounts || new ns.models.InstanceAccountSet({}, { instanceId: this.model.get("id") });
                this.accounts.fetchAll();
                this.accounts.bind("reset", function () {
                    this.users.add(this.accounts.users());
                    this.users.trigger("reset");
                }, this);
            }
        }
    });
})
    (jQuery, chorus);
