chorus.views.DatasetEditChorusView = chorus.views.CodeEditorView.extend({
    className: "dataset_edit_chorus_view",

    setup: function() {
        this._super("setup");
        this.bind("dataset:saveEdit", this.saveModel, this);
        this.model.initialQuery = this.model.get("query");
        this.bindings.add(this.model, "saved", this.navigateToChorusViewShowPage);
    },

    postRender:function () {
            var self = this;
            var opts = {
                readOnly: false,
                mode: "text/x-sql",
                fixedGutter:true,
                theme:"default",
                lineWrapping:true,
                extraKeys:{},
                onBlur: _.bind(this.updateQueryInModel, self)
            };

        this._super("postRender", [opts]);
    },

    updateQueryInModel: function() {
        this.model.set({query: this.editor.getValue()}, {silent: true});
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
