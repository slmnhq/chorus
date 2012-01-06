;(function(ns){
    ns.dialogs.InstancePermissions = ns.dialogs.Base.extend({
        className : "instance_permissions",
        title : t("instances.permissions_dialog.title"),
        persistent : true,

        events : {
            "click a.edit" : "editCredentials",
            "click a.save" : "save",
            "click a.cancel" : "cancel",

            "click a.alert" : "removeSharedAccountAlert"
        },

        makeModel : function() {
            this.model = this.options.pageModel.sharedAccount();
            this.model.fetch();
            this.model.bind("saved", this.saved, this);
            this.model.bind("saveFailed", this.saveFailed, this);
            this.model.bind("validationFailed", this.saveFailed, this);

            this._super("makeModel")

            this.instance = this.options.pageModel;
            this.collection = new ns.models.InstanceAccountSet([this.model]);
        },

        collectionModelContext: function(account) {
            var user = account.user()
            if(user) {
                return {
                    fullName: user.get("fullName"),
                    imageUrl: user.imageUrl()
                }
            } else {
                return {};
            }
        },

        editCredentials : function(event) {
            event.preventDefault();
            $(event.target).closest("li").addClass("editing");
        },

        save : function(event) {
            event.preventDefault();
            this.$("a.save").startLoading("instances.permissions.saving")

            this.model.save({
                dbUserName : this.$("input[name=dbUserName]").val(),
                dbPassword : this.$("input[name=dbPassword]").val()
            });
        },

        cancel : function(event) {
            event.preventDefault();
            this.$("li").removeClass("editing");
        },

        saved : function() {
            this.$("a.save").stopLoading();
            this.$("li").removeClass("editing");
            this.instance.fetch();
        },

        saveFailed : function() {
            this.$("a.save").stopLoading();
        },

        removeSharedAccountAlert : function(e) {
            e.preventDefault();
            var alert = new ns.alerts.RemoveSharedAccount();
            alert.bind("removeSharedAccount", _.bind(this.confirmRemoveSharedAccount, this));
            this.launchSubModal(alert);
        },

        confirmRemoveSharedAccount : function() {
            var map = this.model;
            this.model.bind("saved", displaySuccessToast);
            this.model.bind("saveFailed", displayFailureToast);

            var id = this.account.get("id")
            this.account.clear({silent: true});
            this.account.save({id: id, shared: "no"});

            function displaySuccessToast() {
                ns.toast("instances.shared_account_removed");
                map.unbind("saved", displaySuccessToast);
                map.unbind("saveFailed", displayFailureToast);
            }

            function displayFailureToast() {
                ns.toast("instances.shared_account_remove_failed");
                map.unbind("saved", displaySuccessToast);
                map.unbind("saveFailed", displayFailureToast);
            }
        }
    });
})(chorus);
