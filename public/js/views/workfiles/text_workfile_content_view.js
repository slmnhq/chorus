;
(function($, ns) {
    ns.views.TextWorkfileContent = ns.views.Base.extend({
        className : "text_workfile_content",

        postRender : function() {
           var opts = {
               readOnly : "nocursor",
               lineNumbers: true,
               mode: "null", // null -> plain text
               fixedGutter: true
            };

            this.editor = CodeMirror.fromTextArea(this.$(".text_editor")[0], opts);
        },

        editText : function() {
            this.editor.setOption("readOnly", false);
        }
    });

})(jQuery, chorus);