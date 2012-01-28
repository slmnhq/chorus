chorus.views.SandboxNewStandaloneMode = chorus.views.Base.extend({
    className:"sandbox_new_standalone_mode",

    fieldValues:function () {
        return {
            instanceName:this.$("input[name='instanceName']").val(),
            databaseName:this.$("input[name='databaseName']").val(),
            schemaName:this.$("input[name='schemaName']").val(),
            size:this.$("input[name='size']").val()
        }
    }
});