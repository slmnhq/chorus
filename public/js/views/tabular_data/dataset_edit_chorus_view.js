chorus.views.DatasetEditChorusView = chorus.views.CodeEditorView.extend({
    className: "dataset_edit_chorus_view",

    setup: function() {
        this._super("setup");
        chorus.PageEvents.subscribe("dataset:saveEdit", this.saveModel, this);
        chorus.PageEvents.subscribe("dataset:cancelEdit", this.cancelEdit, this);
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

        this.model.set({query: query}, {silent: true});
        this.model.save(undefined, {silent: true});
    },

    cancelEdit: function() {
        delete this.model.serverErrors;
    },

    navigateToChorusViewShowPage: function() {
        chorus.router.navigate( this.model.showUrl());
    }
});
