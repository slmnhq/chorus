chorus.views.InstanceConfigurationDetails = chorus.views.Base.extend({
    templateName: "instance_configuration_details",

    additionalContext: function() {
        return {
            dbUsername: this.model.isShared() && this.model.accountForOwner().get("dbUsername"),
            version: this.model.version()
        };
    }
});
