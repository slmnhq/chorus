chorus.views.Login = chorus.views.Base.extend({
    constructorName: "LoginView",
    templateName:"login",
    events:{
        "submit form":"submitLoginForm"
    },

    persistent:true,

    setup:function () {
        this.bindings.add(this.model, "saved", this.onLogin);
    },

    postRender : function() {
        this.$(".legal .version").load("/VERSION" + "?buster=" + chorus.cachebuster());
        _.defer(_.bind(function() {this.$("input[name='userName']").focus()}, this));
    },

    onLogin : function () {
        var targetDestination;

        if (chorus.session && chorus.session.shouldResume()) {
            targetDestination = chorus.session.resumePath();
        } else {
            targetDestination = "/";
        }

        chorus.router.navigate(targetDestination);
    },

    submitLoginForm:function submitLoginForm(e) {
        e.preventDefault();

        this.model.clear({ silent:true });
        delete this.model.id;
        this.model.set({
            userName:this.$("input[name='userName']").val(),
            password:this.$("input[name='password']").val()
        });
        this.model.save();
    }
});
