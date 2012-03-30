chorus.views.InstanceConfigurationDetails = chorus.views.Base.extend({
    className: "instance_configuration_details",

    additionalContext: function() {
        return {
            dbUserName: this.model.get('sharedAccount') && this.model.get('sharedAccount').dbUserName
        };
    }
});
