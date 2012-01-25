;(function($, ns) {
    ns.views.DatasetListSidebar = chorus.views.Sidebar.extend({
        className : "dataset_list_sidebar",

        setup: function() {
            this.bind("dataset:selected", this.setDataset, this);
        },

        setDataset: function(dataset) {
            this.resource = dataset;
            this.render();
        },

        additionalContext : function() {
            return {
                typeString: this.datasetType(this.resource)
            }
        },

        datasetType : function(dataset) {
            if (!dataset) {
                return "";
            }
            
            var key = ["dataset.types", dataset.get("type"), dataset.get("objectType")].join(".");
            return t(key);
        }
    });
})(jQuery, chorus);