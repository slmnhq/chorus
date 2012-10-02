chorus.views.DatasetShowContentHeader = chorus.views.ListHeaderView.extend({
    templateName: "dataset_show_content_header",

    additionalContext: function() {
        return {
            importFrequency: chorus.helpers.importFrequencyForModel(this.model),
            workspacesAssociated: this.model.workspacesAssociated(),
            tableauWorkbooks: this.model.tableauWorkbooks(),
            dataset: this.model.asWorkspaceDataset(),
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