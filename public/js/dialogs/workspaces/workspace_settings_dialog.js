chorus.dialogs.WorkspaceSettings = chorus.dialogs.Base.extend({
    className:"workspace_settings",
    title:t("workspace.settings.title"),
    persistent:true,

    events:{
        "submit form":"updateWorkspace",
        "click button.submit":"updateWorkspace",
        "click a.bold": "onClickToolbarBold",
        "click a.italic": "onClickToolbarItalic",
        "click a.bullets": "onClickToolbarBullets",
        "click a.numbers": "onClickToolbarNumbers",
        "click a.link": "onClickToolbarLink",
        "click a.unlink": "onClickToolbarUnlink"
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
            permission: this.hasPermission,
            ownerName: this.owner && this.owner.displayName(),
            ownerUrl: this.owner.showUrl(),
            sandboxLocation:sandboxLocation,
            disable : this.hasPermission ? "" : ' disabled="disabled" '
        }
    },

    setup:function () {
        var ownerId = this.pageModel.get("ownerId");
        this.owner = this.pageModel.members().find(function (member) {
            return member.get("id") == ownerId
        });

        this.hasPermission = (ownerId == chorus.session.user().get("id")) || chorus.session.user().get("admin");
        this.imageUpload = new chorus.views.ImageUpload({
            model:this.pageModel,
            addImageKey:"workspace.settings.image.add",
            changeImageKey:"workspace.settings.image.change",
            spinnerSmall:true,
            editable: this.hasPermission
        });

        this.bindings.add(this.pageModel, "saved", this.saved);
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
        this.$("select.owner").val(this.model.get("ownerId"));
        _.defer(function() {
            $("textarea[name=summary]").cleditor({controls: "bold italic | bullets numbering | link unlink"});
        });
    },

    onClickToolbarBold: function(e) {
        e && e.preventDefault();
        this.$(".cleditorButton[title='Bold']").click();
    },

    onClickToolbarItalic: function(e) {
        e && e.preventDefault();
        this.$(".cleditorButton[title='Italic']").click();
    },

    onClickToolbarBullets: function(e) {
        e && e.preventDefault();
        this.$(".cleditorButton[title='Bullets']").click();
    },

    onClickToolbarNumbers: function(e) {
        e && e.preventDefault();
        this.$(".cleditorButton[title='Numbering']").click();
    },

    onClickToolbarLink: function(e) {
        e && e.preventDefault();
        this.$(".cleditorButton[title='Insert Hyperlink']").click();
        e.stopImmediatePropagation();
    },

    onClickToolbarUnlink: function(e) {
        e && e.preventDefault();
        this.$(".cleditorButton[title='Remove Hyperlink']").click();
    },

    updateWorkspace:function (e) {
        e.preventDefault();
        var active = !!this.$("input#workspace_active").is(":checked");

        var attrs = {
            name:this.$("input[name=name]").val().trim(),
            summary:this.$("textarea[name=summary]").val().trim(),
            isPublic:!!this.$("input[name=isPublic]").is(":checked"),
            active:active,
            archived:!active
        };

        if (this.$("select.owner").length > 0) {
            attrs.ownerId = this.$("select.owner").val();
            attrs.ownerName = this.model.members().get(attrs.ownerId).get("userName");
        }

        this.pageModel.save(attrs);
    },

    saved:function () {
        this.pageModel.trigger("invalidated");
        this.closeModal();
    }
});
