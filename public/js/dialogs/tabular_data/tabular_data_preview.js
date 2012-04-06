chorus.dialogs.TabularDataPreview = chorus.dialogs.Base.extend({
    className: 'tabular_data_preview',
    title: function() {return t("dataset.data_preview_title", {name: this.model.get("objectName")}); },

    events: {
        "click button.cancel": "cancelTask"
    },

    subviews: {
        '.results_console': 'resultsConsole'
    },

    setup: function() {
        _.bindAll(this, 'title');
        this.resultsConsole = new chorus.views.ResultsConsole({footerSize: _.bind(this.footerSize, this)});
        this.closePreviewHandle = chorus.PageEvents.subscribe("action:closePreview", this.closeModal, this);
        this.modalClosedHandle = chorus.PageEvents.subscribe("modal:closed", this.cancelTask, this);
    },

    footerSize: function() {
        return this.$('.modal_controls').outerHeight(true);
    },

    postRender: function() {
        this.task = this.model.preview();
        this.resultsConsole.execute(this.task);
    },

    cancelTask: function(e) {
        this.task && this.task.cancel();
        chorus.PageEvents.unsubscribe(this.modalClosedHandle);
    },

    close: function() {
        chorus.PageEvents.unsubscribe(this.closePreviewHandle);
    }
});