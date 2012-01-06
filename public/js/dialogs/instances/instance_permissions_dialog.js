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
            this.instance = this.options.pageModel;
            this.model = this.instance.sharedAccount();
            this.collection = this.instance.accounts();

            this.collection.bind("saved", this.saved, this);
            this.collection.bind("saveFailed", this.saveFailed, this);
            this.collection.bind("validationFailed", this.saveFailed, this);

            this._super("makeModel")
        },

        additionalContext: function() {
            return { sharedAccount: !!this.instance.sharedAccount() };
        },

        collectionModelContext: function(account) {
            var user = account.user()
            if(user) {
                return {
                    fullName: user.displayName(),
                    imageUrl: user.imageUrl()
                }
            } else {
                return {};
            }
        },

        editCredentials : function(event) {
            event.preventDefault();
            var li = $(event.target).closest("li");
            var accountId = li.data("id");
            li.addClass("editing");
            this.account = this.resource = this.collection.get(accountId);
        },

        save : function(event) {
            event.preventDefault();
            var li = $(event.target).closest("li");
            li.find("a.save").startLoading("instances.permissions.saving")

            this.account.save({
                dbUserName : li.find("input[name=dbUserName]").val(),
                dbPassword : li.find("input[name=dbPassword]").val()
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
