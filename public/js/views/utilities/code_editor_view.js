chorus.views.CodeEditorView = chorus.views.Base.extend({
    className: "code_editor_view",

    setup: function() {
        chorus.PageEvents.subscribe("file:insertText", this.insertText, this);
    },

    postRender: function(editorOptions, preEditRefreshFunction) {
        var opts = $.extend(editorOptions, { lineNumbers: true});
        _.defer(_.bind(function() {
            var textArea = this.$(".text_editor")[0];
            if (textArea !== this.textArea) {
                this.textArea = textArea;
                this.editor = CodeMirror.fromTextArea(this.textArea, opts);

                if (preEditRefreshFunction) {
                    preEditRefreshFunction();
                }

                var ed = this.editor;
                _.defer(function() {
                    ed.refresh();
                    ed.refresh();
                    ed.refresh();
                });
            }
        }, this)
        );
    },

    insertText: function(text) {
        this.editor.focus();
        this.editor.replaceSelection(text)
        this.editor.setCursor(this.editor.getCursor(false))
    }
});