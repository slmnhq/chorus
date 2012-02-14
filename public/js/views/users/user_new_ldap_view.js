(function() {
    chorus.views.UserNewLdap = chorus.views.Base.extend({
        className: "user_new_ldap",

        persistent: true,

        events : {
            "click a.check_username": "checkUsername",
            "submit form": "submitNewUser"
        },

        setup: function() {
            this.model.bind("saved", userSuccessfullySaved, this);
        },

        checkUsername: function() {
            var username = this.$("input[name=userName]").val();
            this.collection = new chorus.collections.LdapUserSet([], { userName: username });
            this.collection.bind("reset", this.ldapUsersFetched, this);
            this.collection.fetch();
        },

        ldapUsersFetched: function() {
            var model = this.collection.first();
            if (model) {
                this.$("input[name='firstName']").val(model.get("firstName"));
                this.$("input[name='lastName']").val(model.get("lastName"));
                this.$("input[name='emailAddress']").val(model.get("emailAddress"));
                this.$("input[name='title']").val(model.get("title"));
                this.$("input[name='ou']").val(model.get("ou"));
            } else {
                var alert = new chorus.alerts.NoLdapUser({ username: this.collection.attributes.userName });
                alert.launchModal();
            }
        },

        submitNewUser: function(e) {
            e.preventDefault();

            var updates = {};
            _.each(this.$("input"), function (i) {
                var input = $(i);
                updates[input.attr("name")] = input.val().trim();
            });
            updates.admin = this.$("input#admin-checkbox").prop("checked") || false;

            this.model.save(updates, { method: "create" });
        }

        // goBack: function() {
        //     window.history.back();
        // }
    });

    function userSuccessfullySaved() {
        chorus.router.navigate("/users", true);
    }
})();

