;(function($, ns) {
    ns.views.DatasetListSidebar = chorus.views.Sidebar.extend({
        className : "dataset_list_sidebar",

        setup: function() {
            this.bind("dataset:selected", this.setDataset, this);
        },

        setDataset: function(dataset) {
            this.resource = dataset;
            this.render();
        }
    });
})(jQuery, chorus);