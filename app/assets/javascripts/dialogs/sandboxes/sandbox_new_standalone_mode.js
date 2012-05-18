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
            instance_name: this.$("input[name='" + (this.options.addingSandbox ? "instance_name" : "name") + "']").val(),
            databaseName: this.$("input[name='databaseName']").val(),
            schemaName: this.$("input[name='schemaName']").val(),
            size: this.$("input[name='size']").val(),
            db_username: this.$("input[name='db_username']").val(),
            db_password: this.$("input[name='db_password']").val()
        }
    }
});
