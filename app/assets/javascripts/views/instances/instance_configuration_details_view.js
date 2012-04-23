chorus.views.InstanceConfigurationDetails = chorus.views.Base.extend({
    templateName: "instance_configuration_details",

    additionalContext: function() {
        return {
            dbUserName: this.model.get('sharedAccount') && this.model.get('sharedAccount').dbUserName
        };
    }
});
