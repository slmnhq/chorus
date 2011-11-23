(function($, ns) {
    ns.DeleteWorkfile = chorus.alerts.Base.extend({
        text : t("workfile.delete.text"),
        ok : t("workfile.delete.button"),
        persistent: true,

        events : {
            "click button.submit" : "deleteWorkfile"
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.Workfile({
                    id : this.options.launchElement.data("workfile-id"),
                    workspaceId : this.options.launchElement.data("workspace-id"),
                    fileName : this.options.launchElement.data("workfile-name")
            });
        },

        setup : function(){
            this.title = t("workfile.delete.title", this.model.get("fileName"));
            this.model.bind("destroy", this.workfileDeleted, this);
            this.model.bind("destroyFailed", this.render, this);
        },

        deleteWorkfile : function (e) {
            e.preventDefault();
            this.model.destroy();
        },

        workfileDeleted : function () {
            $(document).trigger("close.facebox");
            chorus.router.navigate("/workspaces/" + this.model.get("workspaceId") + "/workfiles", true);
        }
    });
})(jQuery, chorus.alerts);
