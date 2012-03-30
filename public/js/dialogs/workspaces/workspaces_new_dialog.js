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
        this.bindings.add(this.resource, "saved", this.workspaceSaved);
        this.bindings.add(this.resource, "saveFailed", function() { this.$("button.submit").stopLoading() });
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
        chorus.router.navigate("/workspaces/" + this.model.get("id") + "/quickstart", true);
    },

    checkInput : function() {
        var hasText = this.$("input[name=name]").val().trim().length > 0;
        this.$("button.submit").prop("disabled", hasText ? false : "disabled");
    }
});
