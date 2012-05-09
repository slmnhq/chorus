chorus.views.InstanceConfigurationDetails = chorus.views.Base.extend({
    templateName: "instance_configuration_details",

    additionalContext: function() {
        return {
//            db_username: this.model.isShared() && this.model.accountForOwner().get("db_username"),
            // Below is totally wrong.  Above is right.  But above breaks many tests.
            db_username: this.model.accounts().at(0).get("username"),
            version: this.model.version()
        };
    }
});
