(function($, ns) {
    ns.Login = chorus.views.Base.extend({
        className : "login",
        events : {
            "submit form" : "submitLoginForm"
        },

        setup : function() {
            this.model.bind("saved", this.navigateToDashboard)
        },

        navigateToDashboard: function(model) {
            chorus.user = chorus.fetchUser();
            chorus.router.navigate("/", true);
        },

        submitLoginForm: function submitLoginForm(e) {
            e.preventDefault();

            this.model.set({
                userName: this.$("input[name='userName']").val(),
                password: this.$("input[name='password']").val()
            });
            this.model.save();
        }
    });
})(jQuery, chorus.views);
