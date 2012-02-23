chorus.dialogs.WorkspacesNew = chorus.dialogs.Base.extend({
    className:"workspaces_new",
    title:"Create a New Workspace",

    persistent:true,

    events:{
        "keyup input[name=name]": "checkInput",
        "paste input[name=name]": "checkInput",
        "submit form.new_workspace":"createWorkspace"
    },

    makeModel:function () {
        this.model = this.model || new chorus.models.Workspace()
    },

    setup:function () {
        this.resource.bind("saved", this.workspaceSaved, this);
        this.resource.bind("saveFailed", function() {this.$("button.submit").stopLoading()}, this)
    },

    createWorkspace:function createWorkspace(e) {
        e.preventDefault();

        this.resource.set({
            name:this.$("input[name=name]").val().trim(),
            isPublic:!!this.$("input[name=isPublic]").is(":checked")
        })

        this.$("button.submit").startLoading("actions.creating")
        this.resource.save();
    },

    workspaceSaved:function () {
        $(document).trigger("close.facebox");
        chorus.router.navigate("/workspaces/" + this.model.get("id"), true);
    },

    checkInput : function() {
        var hasText = this.$("input[name=name]").val().trim().length > 0;
        this.$("button.submit").prop("disabled", hasText ? false : "disabled");
    }
});