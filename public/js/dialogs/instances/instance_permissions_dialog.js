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
            this.instance = this.options.pageModel;
            this.model = this.instance.sharedAccount();
            this.users = new ns.models.UserSet();
            this.users.bind("reset", this.populateSelect, this);
            this.users.sortAsc("lastName");
            this.users.fetchAll();
            this.collection = this.instance.accounts();

            this.collection.bind("reset", this.render, this);
            this.collection.bind("add", this.render, this);
            this.collection.bind("saved", this.saved, this);
            this.collection.bind("saveFailed", this.saveFailed, this);
            this.collection.bind("validationFailed", this.saveFailed, this);

            this._super("makeModel")
        },

        additionalContext: function() {
            return {
                sharedAccount: !!this.instance.sharedAccount(),
                accountCount: this.collection.reject(function(account) {return account.isNew()}).length
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
            this.account = this.resource = this.collection.get(accountId);
        },

        cancelChangeOwner : function(e){
            e.preventDefault();
            this.$("div.name").removeClass("hidden");
            this.$("a.change_owner").removeClass("hidden");
            this.$("a.edit").removeClass("hidden");
            this.$("a.save_owner").addClass("hidden");
            this.$("select.name").addClass("hidden");
            this.$("a.cancel_change_owner").addClass("hidden");
            this.$(".links .owner").removeClass("hidden");
        },

        changeOwner: function(e) {
            if (e)  e.preventDefault();
            var select = this.$("select.name");
            select.removeClass("hidden");
            this.$("div.name").addClass("hidden");
            this.$("a.change_owner").addClass("hidden");
            this.$("a.save_owner").removeClass("hidden");
            this.$("a.cancel_change_owner").removeClass("hidden");
            this.$("a.edit").addClass("hidden");
            this.$(".links .owner").addClass("hidden");
            chorus.styleSelect(select);
        },

        confirmSaveOwner: function(e) {
            e.preventDefault();
            this.launchSubModal("hi");
        },

        newAccount: function(e) {
            var button = this.$("button.add_account");
            if (button.is(":disabled")) return;
            this.account = this.resource = new ns.models.InstanceAccount({instanceId: this.instance.get("id")});
            this.collection.add(this.account);
            this.$("button.add_account").attr("disabled", "disabled");
            this.$("li[data-id=new]").addClass('editing new');
            this.$("li[data-id=new] div.name").addClass("hidden");

            this.populateNewAccountSelect();

            var select = this.$("li[data-id=new] select.name");
            select.removeClass("hidden");
            chorus.styleSelect(select);
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
            if(event) {
                event.preventDefault();
            }
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
            var map = this.model;
            this.model.bind("saved", displaySuccessToast, this);
            this.model.bind("saveFailed", displayFailureToast);

            var id = this.model.get("id")
            this.model.clear({silent: true});
            this.model.save({id: id, shared: "no"});

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
