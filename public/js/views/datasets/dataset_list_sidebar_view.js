;(function($, ns) {
    ns.views.DatasetListSidebar = chorus.views.Sidebar.extend({
        className : "dataset_list_sidebar",

        subviews : {
            '.tab_control' : 'tabControl'
        },

        setup: function() {
            this.bind("dataset:selected", this.setDataset, this);
            this.tabControl = new chorus.views.TabControl([{name: 'activity', selector: ".activity_list"}, {name: 'statistics', selector: ".statistics_detail"}]);
        },

        setDataset: function(dataset) {
            this.resource = dataset;
            this.statistics = dataset.statistics();
            this.statistics.bindOnce("change", this.render, this);
            this.statistics.fetch();
            this.render();
        },

        additionalContext : function() {
            var ctx = {
                typeString: this.datasetType(this.resource)
            }

            if (this.statistics) {
                ctx.statistics = this.statistics.attributes;
            }

            return ctx;
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