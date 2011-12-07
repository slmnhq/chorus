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
                hasImage : this.pageModel.hasImage()
            }
        },

        setup : function() {
            this.imageUpload = new ns.views.ImageUpload({
               model : this.pageModel,
               addImageKey: "workspace.settings.image.add",
               changeImageKey: "workspace.settings.image.change"
            });
            this.pageModel.bind("saved", this.closeModal, this);
        },

        postRender : function() {
            this.$(".edit_photo").html(this.imageUpload.render().el);
        },

        updateWorkspace : function(e) {
            e.preventDefault();
            this.pageModel.save({
                name: this.$("input[name=name]").val().trim(),
                summary: this.$("textarea[name=summary]").val().trim()
            });
        },

        makeModel: function(options) {
            this._super("makeModel", options)
            this.model = this.pageModel;
        }
    });
})(chorus);
