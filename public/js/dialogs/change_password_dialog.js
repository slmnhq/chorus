;(function($, ns) {
    ns.ChangePassword = chorus.dialogs.Base.extend({
        className : "change_password",
        title : t("user.change_password.title"),
        events: {
            "submit form": "save"
        },

        save: function(e) {
            e.preventDefault();
            this.model.set({
                password : this.$("input[name=password]").val(),
                passwordConfirmation: this.$("input[name=passwordConfirmation]").val()
            }, { silent : true })
            this.model.bind("saved", this.saved, this);
            this.model.save();
        },

        saved: function() {
            $(document).trigger("close.facebox");
        }
    });
})(jQuery, chorus.dialogs);
