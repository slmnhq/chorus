chorus.views.DatasetEditChorusView = chorus.views.Base.extend({
    className: "dataset_edit_chorus_view",

    postRender:function () {
            var self = this;
            var opts = {
                readOnly: false,
                lineNumbers:true,
                mode: "text/x-sql",
                fixedGutter:true,
                theme:"default",
                lineWrapping:true,
                extraKeys:{}
            };

            _.defer(_.bind(function () {
                var textArea = this.$(".text_editor")[0];
                if (textArea !== this.textArea) {
                    this.textArea = textArea;
                    this.editor = CodeMirror.fromTextArea(this.textArea, opts);

                    var ed = this.editor;
                    _.defer(function () {
                        ed.refresh();
                        ed.refresh();
                        ed.refresh();
                    });
                }
            }, this)
            );


        }
});