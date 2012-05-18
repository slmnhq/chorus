chorus.dialogs.WorkspaceSettings = chorus.dialogs.Base.include(
    chorus.Mixins.ClEditor
).extend({
    constructorName: "WorkspaceSettings",

    templateName:"workspace_settings",
    title:t("workspace.settings.title"),
    persistent:true,

    events:{
        "submit form":"updateWorkspace",
        "click button.submit":"updateWorkspace"
    },

    additionalContext:function () {
        var sandbox = this.pageModel.sandbox();
        var sandboxLocation = sandbox ? sandbox.canonicalName() : t("workspace.settings.sandbox.none");
        var owner = this.pageModel.owner();

        return {
            imageUrl:this.pageModel.fetchImageUrl(),
            hasImage:this.pageModel.hasImage(),
            members:this.pageModel.members().models,
            canSave : this.pageModel.canUpdate(),
            canChangeOwner: this.pageModel.workspaceAdmin(),
            ownerName: owner.displayName(),
            ownerUrl: owner.showUrl(),
            sandboxLocation: sandboxLocation,
            active: this.pageModel.get("archivedAt") == null
        }
    },

    setup: function() {
        this.imageUpload = new chorus.views.ImageUpload({
            model:this.pageModel,
            addImageKey:"workspace.settings.image.add",
            changeImageKey:"workspace.settings.image.change",
            spinnerSmall:true,
            editable: this.pageModel.workspaceAdmin()
        });

        this.bindings.add(this.pageModel, "saved", this.saved);
        this.bindings.add(this.pageModel, "validationFailed", this.saveFailed);
        this.bindings.add(this.pageModel, "saveFailed", this.saveFailed);
        this.model.members().sortAsc("last_name");
        this.model.members().fetch();

        $(document).one('reveal.facebox', _.bind(this.setupSelects, this));
    },

    setupSelects:function () {
        chorus.styleSelect(this.$("select.owner"));
    },

    subviews:{
        '.edit_photo':"imageUpload"
    },

    postRender: function() {
        var canUpdateName = false;
        if (this.pageModel.workspaceAdmin()) {
            canUpdateName = true;
        } else if (this.pageModel.canUpdate()) {
            this.$('input[name=public], input[name=status]').attr('disabled', 'disabled');
            canUpdateName = true;
        } else {
            this.$('input[name=name], input[name=public], textarea[name=summary], input[name=status]').attr('disabled', 'disabled');
        }

        this.$("select.owner").val(this.pageModel.owner().get("id"));

        _.defer(_.bind(function() {
            var clEditor = this.makeEditor($(this.el), ".toolbar", "summary")
            if (!canUpdateName) { clEditor.disable(true) }
        }, this));
    },

    updateWorkspace:function (e) {
        e.preventDefault();
        var active = !!this.$("input#workspace_active").is(":checked");

        var attrs = {
            name: this.$("input[name=name]").val().trim(),
            summary: this.getNormalizedText(this.$("textarea[name=summary]")),
            public: !!this.$("input[name=public]").is(":checked"),
            active: active,
            archived: !active
        };

        if (this.$("select.owner").length > 0) {
            attrs.owner_id = this.$("select.owner").val();
        }

        this.$("button.submit").startLoading("actions.saving");
        this.pageModel.save(attrs);
    },

    saved:function () {
        this.pageModel.trigger("invalidated");
        this.closeModal();
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
    }
});
