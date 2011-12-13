;
(function(ns) {
    ns.dialogs.WorkspaceSettings = ns.dialogs.Base.extend({
        className : "workspace_settings",
        title : t("workspace.settings.title"),

        events : {
            "submit form" : "updateWorkspace",
            "click button.submit" : "updateWorkspace"
        },

        additionalContext : function() {
            return {
                imageUrl : this.pageModel.imageUrl(),
                hasImage : this.pageModel.hasImage(),
                members : this.pageModel.members().models,
                permission :  ((this.pageModel.get("ownerId") == chorus.user.get("id")) || chorus.user.get("admin"))
            }
        },

        setup : function() {
            this.imageUpload = new ns.views.ImageUpload({
                model : this.pageModel,
                addImageKey: "workspace.settings.image.add",
                changeImageKey: "workspace.settings.image.change",
                spinnerSmall: true
            });
            this.pageModel.bind("saved", this.closeModal, this);
            this.model.members().fetch();
        },

        postRender : function() {
            this.$(".edit_photo").html(this.imageUpload.render().el);
            this.$("select.owner").val(this.model.get("ownerId"));
        },

        updateWorkspace : function(e) {
            e.preventDefault();
            var active = !!this.$("input#workspace_active").is(":checked");

            this.pageModel.save({
                name: this.$("input[name=name]").val().trim(),
                summary: this.$("textarea[name=summary]").val().trim(),
                isPublic : !!this.$("input[name=isPublic]").is(":checked"),
                ownerId : this.$("select.owner").val(),
                active: active,
                archived: !active
            });
        }
    });
})(chorus);
