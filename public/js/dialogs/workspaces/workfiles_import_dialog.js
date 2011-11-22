(function($, ns) {
    ns.WorkfilesImport = chorus.dialogs.Base.extend({
        className : "workfiles_import",
        title : t("workfiles.import_dialog.title"),

        persistent: true,

        events : {
            "submit form" : "create"
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.Workfile({workspaceId : this.options.workspaceId})
        },

        setup : function(){
            this.resource.bind("saved", this.saved, this);
        },

        create: function create(e){
        },

        saved : function () {
            $(document).trigger("close.facebox");
            chorus.router.navigate("/workspace/"+this.options.workspaceId+"/workfile/" + this.model.get("id"), true);
        }
    });
})(jQuery, chorus.dialogs);
