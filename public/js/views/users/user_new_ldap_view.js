(function() {
    chorus.views.UserNewLdap = chorus.views.Base.extend({
        className: "user/new_ldap",
        additionalClass: "user_new",

        persistent: true,

        events : {
            "submit form": "formSubmitted",
            "click a.check_username": "checkUsernameClicked",
            "click button.cancel": "goBack"
        },

        setup: function() {
            this.model.ldap = true
            this.bindings.add(this.model, "saved", userSuccessfullySaved);
        },

        postRender: function() {
            this.$("textarea").limitMaxlength();
        },

        checkUsernameClicked: function(e) {
            e.preventDefault();
            this.clearErrors();
            this.checkUsername(this.ldapUsersFetched);
        },

        formSubmitted: function(e) {
            e.preventDefault();
            this.checkUsername(this.submitNewUser);
        },

        checkUsername: function(callback) {
            var username = this.$("input[name=userName]").val();
            this.collection = new chorus.collections.LdapUserSet([], { userName: username });

            this.collection.fetch();

            this.bindings.add(this.collection, "reset", function() {
                if (this.collection.models.length > 0) {
                    callback.call(this);
                } else {
                    this.noLdapUserFound();
                }
            });
        },

        ldapUsersFetched: function() {
            var model = this.collection.first();
            this.$("input[name='firstName']").val(model.get("firstName"));
            this.$("input[name='lastName']").val(model.get("lastName"));
            this.$("input[name='emailAddress']").val(model.get("emailAddress"));
            this.$("input[name='title']").val(model.get("title"));
            this.$("input[name='ou']").val(model.get("ou"));
        },

        noLdapUserFound: function() {
            var alert = new chorus.alerts.NoLdapUser({ username: this.collection.attributes.userName });
            alert.launchModal();
        },

        submitNewUser: function() {
            this.model.save(this.fieldValues(), { method: "create" });
        },

        fieldValues: function() {
            var updates = {};
            _.each(this.$("input, textarea"), function (i) {
                var input = $(i);
                var val = input.val();
                if (input.is("input")) {
                    val = val.trim();
                }
                updates[input.attr("name")] = val;
            });
            updates.admin = this.$("input#admin-checkbox").prop("checked") || false;
            return updates;
        },

        goBack: function() {
             window.history.back();
        }
    });

    function userSuccessfullySaved() {
        chorus.router.navigate("/users", true);
    }
})();

