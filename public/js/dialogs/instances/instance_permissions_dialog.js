;
(function(ns) {
    ns.dialogs.InstancePermissions = ns.dialogs.Base.extend({
        className : "instance_permissions",
        title : t("instances.permissions_dialog.title"),
        persistent : true,

        events : {
            "click a.edit" : "editCredentials",
            "click a.save" : "save",
            "click a.cancel" : "cancel",
            "click button.add_account" : "newAccount",
            "click a.add_shared_account" : "addSharedAccountAlert",
            "click a.change_owner" : "changeOwner",
            "click a.remove_shared_account" : "removeSharedAccountAlert",
            "click a.save_owner" : "confirmSaveOwner",
            "click a.cancel_change_owner" : "cancelChangeOwner"
        },

        makeModel : function() {
            this._super("makeModel", arguments);
            this.instance = this.model;

            this.sharedAccount = this.instance.sharedAccount();
            this.users = new ns.models.UserSet();
            this.users.bind("reset", this.populateSelect, this);
            this.users.sortAsc("firstName");
            this.users.fetchAll();
            this.collection = this.instance.accounts();

            this.collection.bind("reset", this.render, this);
            this.collection.bind("add", this.render, this);
            this.collection.bind("saved", this.saved, this);
            this.collection.bind("saveFailed", this.saveFailed, this);
            this.collection.bind("validationFailed", this.saveFailed, this);

        },

        additionalContext: function(context) {
            var accountServerErrors = (this.account && this.account.serverErrors) || [];
            return {
                sharedAccount: !!this.instance.sharedAccount(),
                accountCount: this.collection.reject(function(account) {return account.isNew()}).length,
                serverErrors: accountServerErrors.concat(context.serverErrors || [])
            };
        },

        collectionModelContext: function(account) {
            var context = {};
            var user = account.user()
            if (user) {
                _.extend(context, {
                    fullName: user.displayName(),
                    imageUrl: user.imageUrl(),
                    isOwner: this.instance.isOwner(account.user())
                });
            }
            if (account.isNew()) {
                context.id = 'new';
                context.isNew = true;
            }
            return context;
        },

        postRender : function() {
            this.$("form").bind("submit", _.bind(this.save, this));
        },

        editCredentials : function(event) {
            event.preventDefault();
            this.cancel();
            this.clearErrors();
            var li = $(event.target).closest("li");
            var accountId = li.data("id");
            li.addClass("editing");
            this.account = this.collection.get(accountId);
        },

        cancelChangeOwner : function(e){
            e.preventDefault();
            var ownerId = this.instance.accountForOwner().get("id");
            var ownerLi = this.$("li[data-id=" + ownerId + "]");
            ownerLi.find("div.name").removeClass("hidden");
            ownerLi.find("a.change_owner").removeClass("hidden");
            ownerLi.find("a.edit").removeClass("hidden");
            ownerLi.find("a.save_owner").addClass("hidden");
            ownerLi.find(".select_container").addClass("hidden");
            ownerLi.find("a.cancel_change_owner").addClass("hidden");
            ownerLi.find(".links .owner").removeClass("hidden");
        },

        changeOwner: function(e) {
            if (e) e.preventDefault();
            var ownerId = this.instance.accountForOwner().get("id");
            var ownerLi = this.$("li[data-id=" + ownerId + "]");
            ownerLi.find("div.name").addClass("hidden");
            ownerLi.find("a.change_owner").addClass("hidden");
            ownerLi.find("a.save_owner").removeClass("hidden");
            ownerLi.find("a.cancel_change_owner").removeClass("hidden");
            ownerLi.find("a.edit").addClass("hidden");
            ownerLi.find(".links .owner").addClass("hidden");
            ownerLi.find(".select_container").removeClass("hidden");
            chorus.styleSelect(ownerLi.find("select.name"));
        },

        confirmSaveOwner: function(e) {
            e.preventDefault();
            var selectedUserId = this.$("select.name").val();
            var selectedUser = this.users.get(selectedUserId);
            var confirmAlert = new ns.alerts.InstanceChangeOwner({ displayName: selectedUser.displayName() });
            confirmAlert.bind("confirmChangeOwner", this.saveOwner, this);
            this.launchSubModal(confirmAlert);
        },

        saveOwner: function() {
            var selectedUserId = this.$("select.name").val();
            this.instance.save({ ownerId: selectedUserId });
            this.instance.bind("saveFailed", this.showErrors, this);
            this.instance.bind("saved", function() {
                ns.toast("instances.confirm_change_owner.toast");
                this.instance.trigger("invalidated");
                this.closeModal();
            }, this);
        },

        newAccount: function(e) {
            var button = this.$("button.add_account");
            if (button.is(":disabled")) return;
            this.account = this.resource = new ns.models.InstanceAccount({instanceId: this.instance.get("id")});
            this.collection.add(this.account);
            this.$("button.add_account").attr("disabled", "disabled");
            var newLi = this.$("li[data-id=new]");
            newLi.addClass('editing new');
            newLi.find("div.name").addClass("hidden");

            this.populateNewAccountSelect();

            newLi.find(".select_container").removeClass("hidden");
            chorus.styleSelect(newLi.find("select.name"));
        },

        populateSelect: function() {
            if (this.instance.sharedAccount()) {
                this.populateOwnerSelect();
            } else {
                this.populateNewAccountSelect();
            }
        },

        populateOwnerSelect: function() {
            var options = this.users.map(function(user) {
                return $("<option/>").text(user.displayName()).val(user.get("id")).outerHtml();
            });
            var select = this.$("select.name");
            select.empty();
            if (select) {
                select.append(options.join(""));
            }
            select.val(this.instance.owner().get("id"));
            this.updateUserSelect();
            $('li[data-id=new] select').change(_.bind(this.updateUserSelect, this));
        },

        populateNewAccountSelect: function() {
            var collectionUserSet = new chorus.models.UserSet(this.collection.users());
            var otherUsers = this.users.select(function(user){return !collectionUserSet.get(user.get("id"))})

            var select = this.$("li.new select.name");
            select.empty();
            if (select) {
                select.append(_.map(otherUsers, function(user) {
                    return $("<option/>").text(user.displayName()).val(user.get("id")).outerHtml();
                }).join(""));
            }
            this.updateUserSelect();
            $('li[data-id=new] select').change(_.bind(this.updateUserSelect, this));
        },

        updateUserSelect: function() {
            var selectedUser = this.users.get($('li[data-id=new] select').val());
            if(selectedUser) {
                this.$('li[data-id=new] img.profile').attr('src', selectedUser.imageUrl());
            }
        },

        save : function(event) {
            event.stopPropagation();
            event.preventDefault();
            var li = $(event.target).closest("li");
            li.find("a.save").startLoading("instances.permissions.saving")

            this.account.bind("validationFailed", function() { this.showErrors(this.account) }, this);
            this.account.bind("saveFailed", function() { this.showErrors(this.account) }, this);
            this.account.save({
                userId: li.find("select").val(),
                dbUserName : li.find("input[name=dbUserName]").val(),
                dbPassword : li.find("input[name=dbPassword]").val()
            });
        },

        modalClosed: function() {
            this.cancel();
            this._super('modalClosed');
        },

        cancel : function(event) {
            if (event) { event.preventDefault(); }
            this.$("button.add_account").removeAttr("disabled");
            this.$("li").removeClass("editing");
            this.$("li[data-id=new]").remove();
            if(this.account && this.account.isNew()) {
                this.collection.remove(this.account, {silent: true});
                delete this.account;
            }
        },

        saved : function() {
            this.instance.fetch();
            this.render();
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
            this.sharedAccount || (this.sharedAccount = this.instance.sharedAccount());

            var map = this.sharedAccount;
            this.sharedAccount.bind("saved", displaySuccessToast, this);
            this.sharedAccount.bind("saveFailed", displayFailureToast);

            var id = this.sharedAccount.get("id")
            this.sharedAccount.clear({silent: true});
            this.sharedAccount.save({id: id, shared: "no"});

            function displaySuccessToast() {
                ns.toast("instances.shared_account_removed");
                this.instance.unset("sharedAccount");
                this.render();
                map.unbind("saved", displaySuccessToast);
                map.unbind("saveFailed", displayFailureToast);
            }

            function displayFailureToast() {
                ns.toast("instances.shared_account_remove_failed");
                map.unbind("saved", displaySuccessToast);
                map.unbind("saveFailed", displayFailureToast);
            }
        },

        addSharedAccountAlert : function(e) {
            e.preventDefault();
            var alert = new ns.alerts.AddSharedAccount();
            alert.bind("addSharedAccount", _.bind(this.confirmAddSharedAccount, this));
            this.launchSubModal(alert);
        },

        confirmAddSharedAccount : function() {
            var account = this.instance.accountForOwner();
            account.bind("saved", displaySuccessToast, this);
            account.bind("saveFailed", displayFailureToast);

            var id = account.get("id")
            account.clear({silent: true});
            account.save({id: id, shared: "yes"});

            function displaySuccessToast() {
                ns.toast("instances.shared_account_added");
                this.instance.unset("sharedAccount");
                this.render();
                account.unbind("saved", displaySuccessToast);
                account.unbind("saveFailed", displayFailureToast);
            }

            function displayFailureToast() {
                ns.toast("instances.shared_account_add_failed");
                account.unbind("saved", displaySuccessToast);
                account.unbind("saveFailed", displayFailureToast);
            }
        }
    });
})(chorus);
