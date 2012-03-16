chorus.Mixins.InstanceCredentials = {};

chorus.Mixins.InstanceCredentials.model = {
    needsInstanceCredentials: function() {
        var errorMessage = this.serverErrors && this.serverErrors[0] && this.serverErrors[0].message
        return !!(errorMessage && errorMessage.match(/Account.*map.*needed/))
    }
};

chorus.Mixins.InstanceCredentials.page = {
    requiredResourcesFetchFailed: function(resource) {
        if (_.isFunction(resource.needsInstanceCredentials) && resource.needsInstanceCredentials()) {
            var dialog = new chorus.dialogs.InstanceAccount({ title: t("instances.account.add.title"), instance: this.instance, reload: true });
            dialog.launchModal();
        } else {
            this._super("requiredResourcesFetchFailed", arguments);
        }
    }
};
