chorus.views.InstanceConfigurationDetails = chorus.views.Base.extend({
    templateName: "instance_configuration_details",

    additionalContext: function() {
        return {
            db_username: this.model.get('sharedAccount') && this.model.get('sharedAccount').db_username
        };
    }
});
