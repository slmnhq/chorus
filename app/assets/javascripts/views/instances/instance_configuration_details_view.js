chorus.views.InstanceConfigurationDetails = chorus.views.Base.extend({
    templateName: "instance_configuration_details",

    additionalContext: function() {
        var shared = this.model.isShared && this.model.isShared();
        return {
            sharedAccountDetails: shared && this.model.sharedAccountDetails(),
            version: this.model.version(),
            shared: shared
        };
    }
});
