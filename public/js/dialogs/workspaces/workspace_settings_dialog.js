;
(function(ns) {
    ns.dialogs.WorkspaceSettings = ns.dialogs.Base.extend({
        className : "workspace_settings",
        title : t("workspace.settings.title"),

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
