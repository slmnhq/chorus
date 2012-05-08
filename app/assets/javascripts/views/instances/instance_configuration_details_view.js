chorus.views.InstanceConfigurationDetails = chorus.views.Base.extend({
    templateName: "instance_configuration_details",

    additionalContext: function() {
        return {
            db_username: this.model.accountForOwner().get("db_username"),
            version: this.model.version()
        };
    }
});
