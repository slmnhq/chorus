chorus.views.InstanceConfigurationDetails = chorus.views.Base.extend({
    templateName: "instance_configuration_details",

    additionalContext: function() {
        return {
            sharedAccountDetails: this.model.isShared && this.model.isShared() && this.model.sharedAccountDetails(),
            version: this.model.version()
        };
    }
});
