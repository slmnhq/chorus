chorus.dialogs.InstanceAccount = chorus.dialogs.Account.extend({
    translationKeys: {
        cancel: 'actions.cancel',
        body: 'instances.account.enter_credentials'
    },

    setup:function () {
        this.title = this.options.title || this.options.launchElement.data("title");
    },

    makeModel:function (options) {
        var instance = this.options.instance || this.options.launchElement.data("instance");
        this.model = instance.accountForCurrentUser();
        this._super("makeModel", arguments);
    },

    modalClosed: function() {
        this._super("modalClosed", arguments);
        if (this.options.reload) {
            if (this.savedSuccessfully) {
                chorus.router.reload();
            } else {
                window.history.back();
            }
        }
    },

    saved: function() {
        this.savedSuccessfully = true;
        this._super('saved');
    }
});
