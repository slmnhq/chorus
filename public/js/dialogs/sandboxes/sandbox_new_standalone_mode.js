chorus.views.SandboxNewStandaloneMode = chorus.views.Base.extend({
    constructorName: "SandboxNewStandaloneMode",

    templateName:"sandbox_new_standalone_mode",

    setup: function() {
        this.requiredResources.push(chorus.models.Config.instance());
    },

    additionalContext: function() {
        return {
            addingSandbox: this.options.addingSandbox,
            provisionMaxSizeInGB: chorus.models.Config.instance().get("provisionMaxSizeInGB")
        };
    },

    fieldValues:function () {
        return {
            instanceName:this.$("input[name='" + (this.options.addingSandbox ? "instanceName" : "name") + "']").val(),
            databaseName:this.$("input[name='databaseName']").val(),
            schemaName:this.$("input[name='schemaName']").val(),
            size:this.$("input[name='size']").val()
        }
    }
});
