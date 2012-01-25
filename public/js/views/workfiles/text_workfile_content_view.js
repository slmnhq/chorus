;
(function($, ns) {
    ns.views.TextWorkfileContent = ns.views.Base.extend({
        className : "text_workfile_content",
        saveInterval : 30000,

        setup : function() {
            this.bind("file:saveCurrent", this.replaceCurrentVersion);
            this.bind("file:createWorkfileNewVersion", this.createWorkfileNewVersion);
            this.bind("file:insertText", this.insertFunction, this)
            this.model.bind("saveFailed", this.versionConflict, this)
        },

        versionConflict : function() {
            if (this.model.serverErrors[0].msgkey == "WORKFILE.VERSION_TIMESTAMP_NOT_MATCH") {
                this.alert = new chorus.alerts.WorkfileConflict({ launchElement : this, model : this.model });
                this.alert.launchModal();
            }
        },

        postRender : function() {
            var readOnlyMode = this.model.canEdit() ? false : "nocursor";
            var self = this;
            var opts = {
                readOnly : readOnlyMode,
                lineNumbers: true,
                mode: this.model.get("mimeType"),
                fixedGutter: true,
                theme: "default",
                lineWrapping: true,
                onChange: _.bind(this.startTimer, this),
                extraKeys : {}
            };

            opts.extraKeys[_.str.capitalize(chorus.hotKeyMeta) + "-R"] = function() {
                chorus.triggerHotKey("r");
            };
            _.defer(_.bind(function() {
                var textArea = this.$(".text_editor")[0];
                if(textArea !== this.textArea) {
                    this.textArea = textArea;
                    this.editor = CodeMirror.fromTextArea(this.textArea, opts);

                    if (this.model.canEdit()) {
                        setTimeout(_.bind(this.editText, this), 100);
                    }

                    var ed = this.editor;
                    _.defer(function() {ed.refresh(); ed.refresh(); ed.refresh();});
                }
            }, this));
        },

        editText : function() {
            if (this.cursor) {
                this.editor.setCursor(this.cursor.line, this.cursor.ch);
            } else {
                var lineCount = this.editor.lineCount();
                var lastLine = this.editor.getLine(lineCount-1)
                var charCount = lastLine.length
                this.editor.setCursor(lineCount-1, charCount)
            }

            this.editor.setOption("readOnly", false);
            this.$(".CodeMirror").addClass("editable");
            this.editor.focus();
        },

        startTimer : function() {
            if (!this.saveTimer) {
                this.saveTimer = setTimeout(_.bind(this.saveDraft, this), this.saveInterval);
            }
        },

        stopTimer : function() {
            if (this.saveTimer) {
                clearTimeout(this.saveTimer);
                delete this.saveTimer;
            }
        },

        saveDraft : function() {
            this.stopTimer();
            this.trigger("autosaved");
            this.model.content(this.editor.getValue(), {silent: true});
            var overrides = {}
            if(this.model.get("hasDraft")) {
                overrides.method = 'update'
            }
            this.model.createDraft().save({}, overrides);
        },

        beforeNavigateAway : function() {
            this._super("beforeNavigateAway");
            if (this.saveTimer) this.saveDraft();
        },

        replaceCurrentVersion : function() {
            this.stopTimer();
            this.cursor = this.editor.getCursor();
            this.model.content(this.editor.getValue(), {silent: true});
            this.model.save({}, {silent : true}); // Need to save silently because content details and content share the same models, and we don't want to render content details
            this.render();
        },

        createWorkfileNewVersion : function() {
            this.stopTimer();
            this.cursor = this.editor.getCursor();
            this.model.content(this.editor.getValue(), {silent: true});

            this.dialog = new chorus.dialogs.WorkfileNewVersion({ launchElement : this, pageModel : this.model, pageCollection : this.collection });
            this.dialog.launchModal(); // we need to manually create the dialog instead of using data-dialog because qtip is not part of page
            this.dialog.model.bind("change", this.render, this);
            this.dialog.model.bind("autosaved", function() { this.trigger("autosaved", "workfile.content_details.save");}, this);
        },

        insertFunction : function(text) {
            this.editor.focus();
            this.editor.replaceSelection(text)
        }
    });

})(jQuery, chorus);
