(function($, ns) {
    ns.UserNew = chorus.views.Base.extend({
        className : "user_new",

        events : {
            "submit form" : 'submitNewUser',
            "click button" : 'submitNewUser'
        },

        setup : function(){
            this.model.bind("saved", userSuccessfullySaved, this);
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.User()
        },

        submitNewUser : function submitNewUser(e) {
            e.preventDefault();

            this.model.set({
                firstName : this.$("#user_firstName").val(),
                lastName : this.$("#user_lastName").val(),
                userName : this.$("#user_userName").val(),
                emailAddress : this.$("#user_emailAddress").val(),
                password : this.$("#user_password").val(),
                passwordConfirmation : this.$("#user_passwordConfirmation").val()
            })

            this.model.save();
        }

    });

    function userSuccessfullySaved() {
        chorus.router.navigate("/users", true);
    }

})(jQuery, chorus.views);
