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

            this.model.set(updates)
            this.model.save();
        }

    });

    function userSuccessfullySaved() {
        chorus.router.navigate("/users", true);
    }

    ns.UserNewMain = chorus.views.MainContentView.extend({
        content : new ns.UserNew(),
        contentHeader : new ns.StaticTemplate("default_content_header", {title: "New User"}),
        contentDetails : new ns.StaticTemplate("plain_text", {text: "Details"})
     })

})(jQuery, chorus.views);
