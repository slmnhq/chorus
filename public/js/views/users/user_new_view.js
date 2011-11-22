(function($, ns) {
    ns.UserNew = chorus.views.Base.extend({
        className : "user_new",

        events : {
            "submit form" : 'submitNewUser'
        },

        persistent: true,

        setup : function(){
            this.model.bind("saved", userSuccessfullySaved, this);
            this.model.bind("saveFailed", showErrors, this);
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

    function showErrors(){
        this.$(".errors").replaceWith(Handlebars.partials.errorDiv(this.context()));
    }

})(jQuery, chorus.views);
