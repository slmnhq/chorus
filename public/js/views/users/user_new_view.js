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

            var updates = {};
            _.each(this.$("input"), function(i){
                var input = $(i);
                updates[input.attr("name")] = input.val();
            });

            updates.admin = this.$("input#admin-checkbox").prop("checked") || false;

            this.model.set(updates)
            this.model.save();
        }
    });

    function userSuccessfullySaved() {
        chorus.router.navigate("/users", true);
    }

})(jQuery, chorus.views);
