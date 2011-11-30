(function($, ns) {
    ns.DeleteWorkfile = chorus.alerts.DeleteModel.extend({
        text : t("workfile.delete.text"),
        ok : t("workfile.delete.button"),


        makeModel : function() {
            this.model = this.model || new chorus.models.Workfile({
                    id : this.options.launchElement.data("workfile-id"),
                    workspaceId : this.options.launchElement.data("workspace-id"),
                    fileName : this.options.launchElement.data("workfile-name")
            });
        },

        setup : function(){
            this.title = t("workfile.delete.title", this.model.get("fileName"));
            this.redirectUrl = "/workspaces/" + this.model.get("workspaceId") + "/workfiles";
        }
    });
})(jQuery, chorus.alerts);
