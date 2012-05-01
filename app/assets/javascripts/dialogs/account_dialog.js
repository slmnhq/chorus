chorus.dialogs.Account = chorus.dialogs.Base.extend({
    constructorName: "AccountDialog",
    templateName:"instance_account",
    translationKeys: {
        cancel: '',
        body: ''
    },

    events:{
        "submit form":"save"
    },

    additionalContext: function() {
        return {
            translationKeys: this.translationKeys,
            translationValues: {}
        };
    },

    makeModel:function () {
        this._super("makeModel", arguments);
        this.bindings.add(this.model, "saved", this.saved);
    },

    save:function (e) {
        e.preventDefault();
        this.model.save({
            db_username:this.$("input[name=db_username]").val(),
            db_password:this.$("input[name=db_password]").val()
        });
    },

    saved:function () {
        this.closeModal();
    }
});
