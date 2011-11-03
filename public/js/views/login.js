(function($, ns) {
    ns.Login = chorus.views.Base.extend({
        className : "login",
        events : {
            "submit form" : "submitLoginForm"
        },

        makeModel : function(){
            this.model = new chorus.models.Login();
        },

        setup : function(){
            this.model.bind("saved", function(model){
                chorus.user = model.attributes;
                chorus.router.navigate("/dashboard", true);
            })
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
