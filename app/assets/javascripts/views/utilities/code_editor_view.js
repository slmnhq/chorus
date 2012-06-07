chorus.views.CodeEditorView = chorus.views.Base.extend({
    templateName: "code_editor_view",

    setup: function(options) {
        this.options = _.extend({
            lineNumbers: true,
            fixedGutter: true,
            theme: "default",
            lineWrapping: true
        }, options);
        chorus.PageEvents.subscribe("file:insertText", this.insertText, this);
    },

    postRender: function() {
        _.defer(_.bind(function() {
            var textArea = this.$(".text_editor")[0];
            if (textArea !== this.textArea) {
                this.textArea = textArea;
                var editor = this.editor = CodeMirror.fromTextArea(this.textArea, this.options);
                _.defer(function() { editor.refresh(); });
                if (this.options.beforeEdit) { this.options.beforeEdit.call(this); }
            }

            this.$(".CodeMirror").droppable({
               drop: _.bind(this.acceptDrop, this)
            });
        }, this));
    },

    additionalContext: function() {
        return { editorContent: this.model.content() };
    },

    acceptDrop: function(e, ui) {
        var pos = this.editor.coordsChar({x: e.pageX, y: e.pageY});
        this.editor.setCursor(pos);
        this.insertText(ui.draggable.data("fullname"));
    },

    insertText: function(text) {
        this.editor.focus();
        this.editor.replaceSelection(text)
        this.editor.setCursor(this.editor.getCursor(false))
    }
});

// delegate methods to the CodeMirror editor
_.each([
    'getValue', 'setValue', 'getOption', 'setOption', 'getSelection',
    'setSelection', 'focus', 'getCursor', 'setCursor', 'lineCount', 'getLine'
], function(method) {
    chorus.views.CodeEditorView.prototype[method] = function() {
        return this.editor[method].apply(this.editor, arguments);
    };
});
