chorus.views.DatasetEditChorusView = chorus.views.Base.extend({
    templateName: "dataset_edit_chorus_view",

    subviews: {
        ".editor": "editor"
    },

    setup: function() {
        this.adaptModelForCodeEditor();
        this.editor = new chorus.views.CodeEditorView({
            model: this.model,
            readOnly: false,
            mode: "text/x-sql",
            extraKeys: {},
            onBlur: _.bind(this.updateQueryInModel, this)
        });

        chorus.PageEvents.subscribe("dataset:saveEdit", this.saveModel, this);
        chorus.PageEvents.subscribe("dataset:cancelEdit", this.cancelEdit, this);
        this.model.initialQuery = this.model.get("query");
        this.bindings.add(this.model, "saved", this.navigateToChorusViewShowPage);
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
    },

    adaptModelForCodeEditor: function () {
        this.model.content = function() { return this.get("query"); };
    }
});
