chorus.dialogs.SqlPreview = chorus.dialogs.Base.extend({
    className: "sql_preview",
    title: t("sql_preview.dialog.title"),

    additionalContext : function() {
        return { sql: _.range(50).join("\n") }
    },

    postRender: function() {
        var opts = {
            readOnly: "nocursor",
            lineNumbers: true,
            mode: "text/x-sql",
            fixedGutter: true,
            theme: "default",
            lineWrapping: true,
        };

        _.defer(_.bind(function() {
            var textArea = this.$(".text_editor")[0];
            if (textArea !== this.textArea) {
                this.textArea = textArea;
                this.editor = CodeMirror.fromTextArea(this.textArea, opts);

                var ed = this.editor;
                _.defer(function() {
                    ed.refresh();
                    ed.refresh();
                    ed.refresh();
                });

                this.setupScrolling(this.$(".container"));
            }
        }, this));
    }
});