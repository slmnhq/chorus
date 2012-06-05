chorus.Mixins.InstanceCredentials = {};

chorus.Mixins.InstanceCredentials.model = {
    instanceRequiringCredentials: function() {
        return new chorus.models.GreenplumInstance(this.errorData);
    }
};

chorus.Mixins.InstanceCredentials.page = {
    dependentResourceForbidden: function(resource) {
        var instance = resource.instanceRequiringCredentials && resource.instanceRequiringCredentials();
        if (instance) {
            var dialog = new chorus.dialogs.InstanceAccount({
                title: t("instances.account.add.title"),
                instance: instance,
                reload: true,
                goBack: true
            });
            dialog.launchModal();
        } else {
            this._super("dependentResourceForbidden", arguments);
        }
    }
};
