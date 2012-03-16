chorus.Mixins.InstanceCredentials = {};

chorus.Mixins.InstanceCredentials.model = {
    instanceRequiringCredentials: function() {
        var errorMessage = this.serverErrors && this.serverErrors[0] && this.serverErrors[0].message
        if (errorMessage && errorMessage.match(/Account.*map.*needed/)) {

            // temporary gaurd, needed until this API story is fixed:
            // https://www.pivotaltracker.com/story/show/26584957
            if (!this.errorData || !this.errorData.instanceId) return;

            return new chorus.models.Instance({
                id: this.errorData.instanceId,
                name: this.errorData.instanceName
            });
        }
    }
};

chorus.Mixins.InstanceCredentials.page = {
    requiredResourcesFetchFailed: function(resource) {
        var instance = resource.instanceRequiringCredentials && resource.instanceRequiringCredentials();
        if (instance) {
            var dialog = new chorus.dialogs.InstanceAccount({
                title: t("instances.account.add.title"),
                instance: instance,
                reload: true
            });
            dialog.launchModal();
        } else {
            this._super("requiredResourcesFetchFailed", arguments);
        }
    }
};
