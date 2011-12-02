;
(function($, ns) {
    ns.views.TextWorkfileContent = ns.views.Base.extend({
        className : "text_workfile_content",

        setup : function(){
            this.bind("file:edit", this.editText);
            this.bind("file:save", this.saveChanges);
        },

        postRender : function() {
            var opts = {
               readOnly : "nocursor",
               lineNumbers: true,
               mode: this.model.get("mimeType"),
               fixedGutter: true,
               theme: "default"
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

        saveChanges : function() {
            this.model.set({"content" : this.editor.getValue()});
            this.model.save();
            this.editor.setOption("readOnly", "nocursor");
            this.$(".CodeMirror").removeClass("editable");
        }
    });

})(jQuery, chorus);