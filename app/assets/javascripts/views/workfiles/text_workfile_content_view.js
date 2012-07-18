chorus.views.TextWorkfileContent = chorus.views.Base.extend({
    templateName: "text_workfile_content",
    saveInterval: 30000,

    subviews: {
        ".editor": "editor"
    },

    setup: function() {
        var self = this;

        var extraKeys = _.reduce(this.options.hotkeys, function(acc, _value, key) {
            var hotkeyString = _.str.capitalize(chorus.hotKeyMeta) + "-" + key.toUpperCase();
            acc[hotkeyString] = function() { chorus.triggerHotKey(key); };
            return acc;
        }, {});

        this.editor = new chorus.views.CodeEditorView({
            model: this.model,
            readOnly: this.model.canEdit() ? false : "nocursor",
            mode: this.mode(),
            onChange: _.bind(this.startTimer, this),
            extraKeys: extraKeys,
            beforeEdit: function() {
                if (self.model.canEdit()) {
                    setTimeout(_.bind(self.editText, self), 100);
                }
            },
            onCursorActivity: function(editor) {
                if (editor.getSelection().length > 0) {
                    chorus.PageEvents.broadcast("file:selectionPresent");
                } else {
                    chorus.PageEvents.broadcast("file:selectionEmpty");
                }
            }
        });

        chorus.PageEvents.subscribe("file:replaceCurrentVersion", this.replaceCurrentVersion, this);
        chorus.PageEvents.subscribe("file:createNewVersion", this.createNewVersion, this);
        chorus.PageEvents.subscribe("file:replaceCurrentVersionWithSelection", this.replaceCurrentVersionWithSelection, this);
        chorus.PageEvents.subscribe("file:createNewVersionFromSelection", this.createNewVersionFromSelection, this);
        chorus.PageEvents.subscribe("file:editorSelectionStatus", this.editorSelectionStatus, this);
        this.bindings.add(this.model, "saveFailed", this.versionConflict);
    },

    mode: function() {
        if (this.model.isSql()) {
            return "text/x-sql";
        } else {
            return "text/plain";
        }
    },

    versionConflict: function() {
        if (this.model.hasConflict()) {
            this.alert = new chorus.alerts.WorkfileConflict({ model: this.model });
            this.alert.launchModal();
        }
    },

    editText: function() {
        if (this.cursor) {
            this.editor.setCursor(this.cursor.line, this.cursor.ch);
        } else {
            var lineCount = this.editor.lineCount();
            var lastLine = this.editor.getLine(lineCount - 1)
            var charCount = lastLine.length
            this.editor.setCursor(lineCount - 1, charCount)
        }

        this.editor.setOption("readOnly", false);
        this.$(".CodeMirror").addClass("editable");
        this.editor.focus();
    },

    startTimer: function() {
        if (!this.saveTimer) {
            this.saveTimer = setTimeout(_.bind(this.saveDraft, this), this.saveInterval);
        }
    },

    stopTimer: function() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            delete this.saveTimer;
        }
    },

    saveDraft: function() {
        this.stopTimer();
        this.trigger("autosaved");
        this.model.content(this.editor.getValue(), {silent: true});
        var overrides = {}
        if (this.model.get("hasDraft")) {
            overrides.method = 'update'
        }
        this.model.createDraft().save({}, overrides);
    },

    beforeNavigateAway: function() {
        this._super("beforeNavigateAway");
        if (this.saveTimer) this.saveDraft();
    },

    saveCursorPosition: function() {
        this.cursor = this.editor.getCursor();
    },

    replaceCurrentVersion: function() {
        this.saveCursorPosition();
        this.replaceCurrentVersionWithContent(this.editor.getValue());
    },

    createNewVersion: function() {
        this.saveCursorPosition();
        this.createNewVersionWithContent(this.editor.getValue());
    },

    replaceCurrentVersionWithSelection: function() {
        this.replaceCurrentVersionWithContent(this.editor.getSelection());
    },

    createNewVersionFromSelection: function() {
        this.createNewVersionWithContent(this.editor.getSelection());
    },

    editorSelectionStatus: function() {
        if (this.editor.getSelection() && this.editor.getSelection().length > 0) {
            chorus.PageEvents.broadcast("file:selectionPresent");
        } else {
            chorus.PageEvents.broadcast("file:selectionEmpty");
        }
    },

    replaceCurrentVersionWithContent: function(value) {
        this.stopTimer();
        this.model.content(value, {silent: true});

        this.model.save({}, {silent: true}); // Need to save silently because content details and content share the same models, and we don't want to render content details
        this.render();
    },

    createNewVersionWithContent: function(value) {
        this.stopTimer();
        this.model.content(value, {silent: true});

        this.dialog = new chorus.dialogs.WorkfileNewVersion({ pageModel: this.model, pageCollection: this.collection });
        this.dialog.launchModal(); // we need to manually create the dialog instead of using data-dialog because qtip is not part of page
        this.bindings.add(this.dialog.model, "change", this.render);
        this.bindings.add(this.dialog.model, "autosaved", function() {
            this.trigger("autosaved", "workfile.content_details.save");
        });
    }
});

