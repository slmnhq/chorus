chorus.views.DatasetEditChorusView = chorus.views.Base.extend({
    className: "dataset_edit_chorus_view",

    setup: function() {
        this.bind("dataset:saveEdit", this.saveModel, this);
        this.model.initialQuery = this.model.get("query");
        this.model.bind("saved", this.navigateToChorusViewShowPage, this);
        chorus.PageEvents.subscribe("file:insertText", this.insertText, this)
    },

    postRender:function () {
            var self = this;
            var opts = {
                readOnly: false,
                lineNumbers:true,
                mode: "text/x-sql",
                fixedGutter:true,
                theme:"default",
                lineWrapping:true,
                extraKeys:{},
                onBlur: _.bind(this.updateQueryInModel, self)
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
    },

    insertText: function(text){
        this.editor.focus();
        this.editor.replaceSelection(text)
        this.editor.setCursor(this.editor.getCursor(false))
    },

    updateQueryInModel: function() {
        this.model.set({query: this.editor.getValue()});
    },

    saveModel: function() {
        var query = this.editor.getValue();

        this.model.set({query: query});
        this.model.save();
    },

    navigateToChorusViewShowPage: function() {
        chorus.router.navigate( this.model.showUrl(), true);
    }
});