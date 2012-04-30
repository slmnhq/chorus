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
        var sandboxLocation = sandbox ?
            sandbox.get("instanceName") + ' / ' + sandbox.get("databaseName") + ' / ' + sandbox.get("schemaName")
            : t("workspace.settings.sandbox.none");

        return {
            imageUrl:this.pageModel.imageUrl(),
            hasImage:this.pageModel.hasImage(),
            members:this.pageModel.members().models,
            canSave : this.pageModel.currentUserIsMember() || this.userIsOwnerOrAdmin(),
            isOwnerOrAdmin : this.userIsOwnerOrAdmin(),
            ownerName: this.owner && this.owner.displayName(),
            ownerUrl: this.owner.showUrl(),
            sandboxLocation:sandboxLocation
        }
    },

    userIsOwnerOrAdmin: function() {
        return this.pageModel.currentUserIsOwner() || chorus.session.user().get("admin");
    },

    setup: function() {
        this.owner = this.pageModel.owner();

        this.imageUpload = new chorus.views.ImageUpload({
            model:this.pageModel,
            addImageKey:"workspace.settings.image.add",
            changeImageKey:"workspace.settings.image.change",
            spinnerSmall:true,
            editable: this.userIsOwnerOrAdmin()
        });

        this.bindings.add(this.pageModel, "saved", this.saved);
        this.bindings.add(this.pageModel, "validationFailed", this.saveFailed);
        this.bindings.add(this.pageModel, "saveFailed", this.saveFailed);
        this.model.members().sortAsc("lastName");
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
        if (this.userIsOwnerOrAdmin()) {
            canUpdateName = true;
        } else if (this.pageModel.currentUserIsMember()) {
            this.$('input[name=isPublic], input[name=status]').attr('disabled', 'disabled');
            canUpdateName = true;
        } else {
            this.$('input[name=name], input[name=isPublic], textarea[name=summary], input[name=status]').attr('disabled', 'disabled');
        }

        this.$("select.owner").val(this.model.get("ownerId"));

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
            isPublic: !!this.$("input[name=isPublic]").is(":checked"),
            active: active,
            archived: !active
        };

        if (this.$("select.owner").length > 0) {
            attrs.ownerId = this.$("select.owner").val();
            attrs.ownerName = this.model.members().get(attrs.ownerId).get("username");
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
