;
(function($, ns) {
    ns.views.TextWorkfileContent = ns.views.Base.extend({
        className : "text_workfile_content",
        saveTimer : undefined,
        saveInterval : 30000,
        cursor : undefined,

        setup : function(){
            this.bind("file:edit", this.editText);
            this.bind("file:save", this.saveChanges);
        },

        postRender : function() {
            var self = this;
            var opts = {
               readOnly : false,
               lineNumbers: true,
               mode: this.model.get("mimeType"),
               fixedGutter: true,
               theme: "default",
               onChange: function() {
                   self.startTimer();
               }
            };

            this.editor = CodeMirror.fromTextArea(this.$(".text_editor")[0], opts);

            setTimeout( function(){ self.editText(); }, 100);
            _.defer(_.bind(this.editor.refresh, this.editor));
        },

        editText : function() {
            var x=0 , y=0;
            if(this.cursor != undefined) {
                x =this.cursor.line;
                y = this.cursor.ch;
            }
            this.editor.setCursor(x, y);
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
            this.cursor = this.editor.getCursor();
            this.model.set({"content" : this.editor.getValue()});
            this.model.save();
        }
    });

})(jQuery, chorus);