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
            this.model.set({
                name: this.$("input[name=name]").val().trim(),
                summary: this.$("textarea[name=summary]").val().trim()
            });

            this.model.save();
        },

        makeModel : function() {
            this.id = this.options.launchElement.data("id");

            var self = this
            this.model = new chorus.models.Workspace({
                id : this.id
            });
            this.model.fetch();
            this.model.bind("saved", function() {
                self.closeModal()
            });
        }
    });
})(chorus);
