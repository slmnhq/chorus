chorus.views.Login = chorus.views.Base.extend({
    constructorName: "LoginView",
    className:"login",
    events:{
        "submit form":"submitLoginForm"
    },

    persistent:true,

    setup:function () {
        this.bindings.add(this.model, "saved", this.navigateToDashboard);
    },

    postRender : function() {
        this.$(".legal .version").load("/VERSION");
    },

    navigateToDashboard:function (model) {
        if(chorus.session && chorus.session.pathBeforeLoggedOut) {
            chorus.router.navigate(chorus.session.pathBeforeLoggedOut, true)
        } else {
            chorus.router.navigate("/", true);
        }
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
