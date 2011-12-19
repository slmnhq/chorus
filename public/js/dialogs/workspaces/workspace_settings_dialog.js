;
(function(ns) {
    ns.dialogs.WorkspaceSettings = ns.dialogs.Base.extend({
        className : "workspace_settings",
        title : t("workspace.settings.title"),
        persistent : true,

        events : {
            "submit form" : "updateWorkspace",
            "click button.submit" : "updateWorkspace"
        },

        additionalContext : function() {
            var ownerId = this.pageModel.get("ownerId")

            var owner = this.pageModel.members().find(function(member) {
                return member.get("id") == ownerId;
            })

            return {
                imageUrl : this.pageModel.imageUrl(),
                hasImage : this.pageModel.hasImage(),
                members : this.pageModel.members().models,
                permission :  ((this.pageModel.get("ownerId") == chorus.session.user().get("id")) || chorus.session.user().get("admin")),
                ownerName : owner && owner.displayName()
            }
        },

        setup : function() {
            this.imageUpload = new ns.views.ImageUpload({
                model : this.pageModel,
                addImageKey: "workspace.settings.image.add",
                changeImageKey: "workspace.settings.image.change",
                spinnerSmall: true
            });
            this.pageModel.bind("saved", this.saved, this);
            this.model.members().fetch();

            $(document).one('reveal.facebox', _.bind(this.setupSelects, this));
        },

        setupSelects : function() {
            this.$("select.owner").chosen({ disable_search_threshold : 1000 });
        },

        subviews: {
            '.edit_photo': "imageUpload"
        },

        postRender : function() {
            this.$("select.owner").val(this.model.get("ownerId"));
        },

        updateWorkspace : function(e) {
            e.preventDefault();
            var active = !!this.$("input#workspace_active").is(":checked");

            var attrs = {
                name: this.$("input[name=name]").val().trim(),
                summary: this.$("textarea[name=summary]").val().trim(),
                isPublic : !!this.$("input[name=isPublic]").is(":checked"),
                active: active,
                archived: !active
            };

            if (this.$("select.owner").length > 0) {
                attrs.ownerId = this.$("select.owner").val();
                attrs.ownerName = this.model.members().get(attrs.ownerId).get("userName");
            }

            this.pageModel.save(attrs);
        },

        saved : function() {
            this.pageModel.trigger("invalidated");
            this.closeModal();
        }
    });
})(chorus);
