chorus.dialogs.InstanceAccount = chorus.dialogs.Account.extend({
    translationKeys: {
        cancel: 'actions.cancel',
        body: 'instances.account.enter_credentials'
    },

    setup:function () {
        this.title = this.options.title || this.options.launchElement.data("title");
    },

    makeModel:function (options) {
        this.model = options.pageModel.accountForCurrentUser();
        this._super("makeModel", arguments);
    },

    saved: function() {
        this._super('saved');
        if (this.options.reload) chorus.router.reload();
    }
});