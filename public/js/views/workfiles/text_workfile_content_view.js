;
(function($, ns) {
    ns.views.TextWorkfileContent = ns.views.Base.extend({
        className : "text_workfile_content",
        saveInterval : 30000,

        setup : function(){
            this.bind("file:saveCurrent", this.replaceCurrentVersion);
            this.bind("file:createWorkfileNewVersion", this.createWorkfileNewVersion);
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
               onChange: function() {
                   self.startTimer();
               }
            };

            this.editor = CodeMirror.fromTextArea(this.$(".text_editor")[0], opts);

            if (this.model.canEdit()) {
                setTimeout( function(){ self.editText(); }, 100);
            }

            _.defer(_.bind(this.editor.refresh, this.editor));
        },

        editText : function() {
            if (this.cursor) {
                this.editor.setCursor(this.cursor.line, this.cursor.ch);
            } else {
                this.editor.setCursor(0, 0);
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
            this.model.set({"content" : this.editor.getValue()}, {silent: true});
            this.model.createDraft().save();
        },

        replaceCurrentVersion : function() {
            this.stopTimer();
            this.cursor = this.editor.getCursor();
            this.model.set({"content" : this.editor.getValue()}, {silent : true});
            this.model.save({}, {silent : true}); // Need to save silently because content details and content share the same models, and we don't want to render content details
            this.render();
        },

        createWorkfileNewVersion : function() {
            this.stopTimer();
            this.cursor = this.editor.getCursor();
            this.model.set({"content" : this.editor.getValue()}, {silent : true});
            this.model.set({"baseVersionNum" : this.model.get("latestVersionNum")}, {silent : true}) // API will remove this baseVersionNum, for now it'll default to latestVersionNum

            this.dialog = new chorus.dialogs.WorkfileNewVersion({ launchElement : this, pageModel : this.model, pageCollection : this.collection });
            this.dialog.launchModal(); // we need to manually create the dialog instead of using data-dialog because qtip is not part of page
            this.dialog.model.bind("change", this.render, this);
            this.dialog.model.bind("autosaved", function() { this.trigger("autosaved", "workfile.content_details.save");}, this);
        }
    });

})(jQuery, chorus);