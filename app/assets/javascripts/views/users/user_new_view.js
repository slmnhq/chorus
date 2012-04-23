chorus.views.UserNew = chorus.views.Base.extend({
    templateName:"user/new",

    events:{
        "submit form":'submitNewUser',
        "click button.cancel":"goBack"
    },

    persistent:true,

    setup:function () {
        this.bindings.add(this.model, "saved", this.userSaved);
    },

    makeModel:function () {
        this.model = this.model || new chorus.models.User()
    },

    postRender: function() {
        this.$("textarea").limitMaxlength();
    },

    submitNewUser:function submitNewUser(e) {
        e.preventDefault();

        var updates = {};
        _.each(this.$("input, textarea"), function (i) {
            var input = $(i);
            var val = input.val();
            if (input.is("input")) {
                val = val.trim();
            }
            updates[input.attr("name")] = val;
        });

        updates.admin = this.$("input#admin-checkbox").prop("checked") || false;

        this.model.set(updates)

        this.model.id = undefined; // since User#idAttribute is userName, we need this for isNew to return true
        this.model.save();
    },

    goBack:function () {
        window.history.back();
    },

    userSaved: function() {
        chorus.router.navigate("/users");
    }
});
