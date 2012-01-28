chorus.views.DatasetListSidebar = chorus.views.Sidebar.extend({
    className:"dataset_list_sidebar",

    subviews:{
        '.tab_control':'tabControl'
    },

    setup:function () {
        this.bind("dataset:selected", this.setDataset, this);
        this.tabControl = new chorus.views.TabControl([
            {name:'activity', selector:".activity_list"},
            {name:'statistics', selector:".statistics_detail"}
        ]);
    },

    setDataset:function (dataset) {
        this.resource = dataset;
        this.statistics = dataset.statistics();
        this.statistics.bindOnce("change", this.render, this);
        this.statistics.fetch();
        this.render();
    },

    additionalContext:function () {
        var ctx = {
            typeString:this.datasetType(this.resource)
        }

        if (this.resource) {
            ctx.entityType = this.resource.entityType;
            ctx.entityId = this.resource.entityId;
        }

        if (this.statistics) {
            ctx.statistics = this.statistics.attributes;
            if (ctx.statistics.rows === 0) {
                ctx.statistics.rows = "0"
            }

            if (ctx.statistics.columns === 0) {
                ctx.statistics.columns = "0"
            }
        }

        return ctx;
    },

    datasetType:function (dataset) {
        if (!dataset) {
            return "";
        }

        var key = ["dataset.types", dataset.get("type"), dataset.get("objectType")].join(".");
        return t(key);
    }
});