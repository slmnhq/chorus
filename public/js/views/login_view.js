(function($, ns) {
    ns.Login = chorus.views.Base.extend({
        className : "login",
        events : {
            "submit form" : "submitLoginForm"
        },

        persistent: true,

        setup : function() {
            this.model.bind("saved", this.navigateToDashboard)
        },

        navigateToDashboard: function(model) {
            chorus.router.navigate("/", true);
        },

        submitLoginForm: function submitLoginForm(e) {
            e.preventDefault();

            this.model.clear({ silent : true });
            delete this.model.id;
            this.model.set({
                userName: this.$("input[name='userName']").val(),
                password: this.$("input[name='password']").val()
            });
            this.model.save();
        }
    });
})(jQuery, chorus.views);
