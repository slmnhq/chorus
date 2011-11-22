(function($, ns) {
    ns.WorkspacesNew = chorus.dialogs.Base.extend({
        className : "workspaces_new",
        title : "Create a New Workspace",

        persistent: true,
        
        events : {
            "submit form.new_workspace" : "createWorkspace"
        },

        postRender : function () {
            console.log("rendered dialog", this);
        },
        
        makeModel : function() {
            this.model = this.model || new chorus.models.Workspace()
        },

        setup : function(){
            this.resource.bind("saved", this.workspaceSaved, this);
            this.model.bind("saveFailed", showErrors, this);
        },

        createWorkspace : function createWorkspace(e){
            e.preventDefault();

            this.resource.set({
                name : this.$("input[name=name]").val(),
                isPublic : !!this.$("input[name=isPublic]").is(":checked")
            })

            this.resource.save();
        },

        workspaceSaved : function () {
            $(document).trigger("close.facebox");
            chorus.router.navigate("/workspaces/" + this.model.get("id"), true);
        }
    });
    function showErrors(){
        this.$(".errors").replaceWith(Handlebars.partials.errorDiv(this.context()));
    }
})(jQuery, chorus.dialogs);
