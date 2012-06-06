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
            mode: this.model.get("mimeType"),
            onChange: _.bind(this.startTimer, this),
            extraKeys: extraKeys,
            beforeEdit: function() {
                if (self.model.canEdit()) {
                    setTimeout(_.bind(self.editText, self), 100);
                }
            }
        });

        chorus.PageEvents.subscribe("file:saveCurrent", this.replaceCurrentVersion, this);
        chorus.PageEvents.subscribe("file:createWorkfileNewVersion", this.createWorkfileNewVersion, this);
        this.bindings.add(this.model, "saveFailed", this.versionConflict);
    },

    versionConflict: function() {
        if (this.model.serverErrors[0].msgkey == "WORKFILE.VERSION_TIMESTAMP_NOT_MATCH") {
            this.alert = new chorus.alerts.WorkfileConflict({ launchElement: this, model: this.model });
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

    replaceCurrentVersion: function() {
        this.stopTimer();
        this.saveCursorPosition();
        this.model.content(this.editor.getValue(), {silent: true});
        this.model.save({}, {silent: true}); // Need to save silently because content details and content share the same models, and we don't want to render content details
        this.render();
    },

    saveCursorPosition: function() {
        this.cursor = this.editor.getCursor();
    },

    createWorkfileNewVersion: function() {
        this.stopTimer();
        this.saveCursorPosition();

        this.model.content(this.editor.getValue(), {silent: true});

        this.dialog = new chorus.dialogs.WorkfileNewVersion({ launchElement: this, pageModel: this.model, pageCollection: this.collection });
        this.dialog.launchModal(); // we need to manually create the dialog instead of using data-dialog because qtip is not part of page
        this.bindings.add(this.dialog.model, "change", this.render);
        this.bindings.add(this.dialog.model, "autosaved", function() {
            this.trigger("autosaved", "workfile.content_details.save");
        });
    }
});

