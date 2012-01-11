;(function(ns, $) {
    ns.views.SandboxNewStandaloneMode = ns.views.Base.extend({
        className: "sandbox_new_standalone_mode",

        setup: function() {
        },

        fieldValues: function() {
            return {
                instanceName: this.$("input[name='instanceName']").val(),
                databaseName: this.$("input[name='databaseName']").val(),
                schemaName: this.$("input[name='schemaName']").val(),
                size: this.$("input[name='instanceSize']").val()
            }
        }
    });
})(chorus, jQuery);
