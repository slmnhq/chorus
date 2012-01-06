;
(function($, ns) {
    ns.views.TextWorkfileContent = ns.views.Base.extend({
        className : "text_workfile_content",
        saveTimer : undefined,
        saveInterval : 30000,

        setup : function(){
            this.bind("file:edit", this.editText);
            this.bind("file:save", this.saveChanges);
        },

        postRender : function() {
            var self = this;
            var opts = {
               readOnly : "nocursor",
               lineNumbers: true,
               mode: this.model.get("mimeType"),
               fixedGutter: true,
               theme: "default",
               onChange: function() {
                   self.startTimer();
               }
            };

            this.editor = CodeMirror.fromTextArea(this.$(".text_editor")[0], opts);
            _.defer(_.bind(this.editor.refresh, this.editor));
        },

        editText : function() {
            this.editor.setCursor(0, 0);
            this.editor.setOption("readOnly", false);
            this.$(".CodeMirror").addClass("editable");
            this.editor.focus();
        },

        startTimer : function() {
            if (this.saveTimer == undefined) {
                var self = this;
                this.saveTimer = setTimeout(function() {
                   self.saveDraft(self);
                }, this.saveInterval);
            }
        },

        stopTimer : function() {
            if (this.saveTimer) {
                clearTimeout(this.saveTimer);
                this.saveTimer = undefined;
            }
        },

        saveDraft : function(self) {
            this.stopTimer();
            self.trigger("autosaved");
            self.model.set({"content" : self.editor.getValue()}, {silent: true});
            self.model.createDraft().save();
        },

        saveChanges : function() {
            this.stopTimer();
            this.model.set({"content" : this.editor.getValue()});
            this.model.save();
            this.editor.setOption("readOnly", "nocursor");
            this.$(".CodeMirror").removeClass("editable");
        }
    });

})(jQuery, chorus);