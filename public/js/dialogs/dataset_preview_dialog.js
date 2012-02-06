chorus.dialogs.DatasetPreview = chorus.dialogs.Base.extend({
    className: 'dataset_preview',

    subviews: {
        '.results_console': 'resultsConsole'
    },

    setup: function() {
        this.resultsConsole = new chorus.views.ResultsConsole();
    },

    postRender: function() {
        this.resultsConsole.execute(this.model.preview());
    }
});