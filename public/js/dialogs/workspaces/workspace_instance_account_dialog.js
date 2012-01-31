chorus.dialogs.WorkspaceInstanceAccount = chorus.dialogs.Account.extend({
    translationKeys: {
        cancel: 'workspace.instance.account.continue_without_credentials',
        body: 'workspace.instance.account.body'
    },

    setup: function() {
        this.title = t('workspace.instance.account.title');
    },

    additionalContext: function() {
        var results = this._super('additionalContext')
        results.translationValues.instanceName = this.pageModel.sandbox().get('instanceName');
        return results;
    }

});