chorus.views.TabularDataShowContentHeader = chorus.views.ListHeaderView.extend({
    templateName: "tabular_data_show_content_header",

    additionalContext: function() {
        return {
            importFrequency: chorus.helpers.importFrequencyForModel(this.model),
            workspacesAssociated: this.model.workspacesAssociated(),
            dataset: this.model.asDataset(),
            showLocation: this.options && this.options.showLocation
        }
    },

    postRender: function() {
        this._super('postRender', arguments);
        if (this.model.importFrequency && this.model.importFrequency()) {
            $(this.el).addClass('has_import');
        }
    }
});