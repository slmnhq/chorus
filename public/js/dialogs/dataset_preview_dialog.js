chorus.dialogs.DatasetPreview = chorus.dialogs.Base.extend({
    className: 'dataset_preview',
    title: function() {return t("dataset.data_preview_title", {name: this.model.get("objectName")}); },

    subviews: {
        '.results_console': 'resultsConsole'
    },

    setup: function() {
        _.bindAll(this, 'title');
        this.resultsConsole = new chorus.views.ResultsConsole({footerSize: _.bind(this.footerSize, this)});
    },

    footerSize: function() {
        return this.$('.modal_controls').outerHeight(true);
    },

    postRender: function() {
        this.resultsConsole.execute(this.model.preview());
    }
});