chorus.dialogs.Account = chorus.dialogs.Base.extend({
    constructorName: "AccountDialog",
    className:"instance_account",
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
            dbUserName:this.$("input[name=dbUserName]").val(),
            dbPassword:this.$("input[name=dbPassword]").val()
        });
    },

    saved:function () {
        this.closeModal();
    }
});
