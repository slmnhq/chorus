;
(function(ns) {
    ns.dialogs.WorkspaceSettings = ns.dialogs.Base.extend({
        className : "workspace_settings",
        title : t("workspace.settings.title"),

        events : {
            "submit form" : "updateWorkspace",
            "click button.submit" : "updateWorkspace"
        },

        updateWorkspace : function(e) {
            e.preventDefault();
            this.pageModel.save({
                name: this.$("input[name=name]").val().trim(),
                summary: this.$("textarea[name=summary]").val().trim()
            });
        },

        bindPageModelCallbacks : function() {
            var self = this;
            this.pageModel.bind("saved", function() {
                self.closeModal()
            });

            // for the context function
            this.resource = this.pageModel;

            // When bindCallbacks is called originally, this.resource has not yet been set.
            this.bindCallbacks();
        }
    });
})(chorus);
